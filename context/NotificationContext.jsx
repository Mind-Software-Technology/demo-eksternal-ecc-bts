'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../lib/api'
import { formatIDR } from '../data/format'
import { NotificationContext } from './notifications'
import { useAuth } from './auth'

// ───────────────────────────────────────────────────────────────────────────
// Site-wide notifications: polls the customer's orders in the background so
// they find out about admin activity — pricing an order (awaiting_quote →
// quoted) or delivering a result file (has_result false → true) — no matter
// which page they're on, not just on /riwayat-pembayaran or /bayar, which
// already poll themselves but only help while sitting on those pages.
// ───────────────────────────────────────────────────────────────────────────

const POLL_MS = 10000
const MAX_STORED = 20
const STATUS_KEY = 'ecc-bts-order-status-seen'
const RESULT_KEY = 'ecc-bts-order-item-result-seen'
const LIST_KEY = 'ecc-bts-notifications'

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable — notifications just won't persist across reloads */
  }
}

export function NotificationProvider({ children }) {
  const { user, ready: authReady } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [toast, setToast] = useState(null)
  // Last-known status per order_no — a status transition only fires a
  // notification when the PREVIOUS value was 'awaiting_quote'. On a fresh
  // browser this map starts empty, so the first poll just records whatever
  // status every order is already in (no notification), instead of firing
  // one for every order that happened to be 'quoted' before this feature
  // ever ran.
  const lastStatuses = useRef(readJSON(STATUS_KEY, {}))
  // Same idea, but per order item (keyed "orderNo:itemId") tracking whether
  // its result file had been delivered yet — a result notification only
  // fires when the PREVIOUS value was explicitly `false`.
  const lastResults = useRef(readJSON(RESULT_KEY, {}))

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads persisted notification history on mount, not derivable from render state
    setNotifications(readJSON(LIST_KEY, []))
  }, [])

  const checkForUpdates = useCallback(async () => {
    let items
    try {
      ;({ items } = await api.orders.list())
    } catch {
      return
    }

    const seenStatus = lastStatuses.current
    const newlyQuoted = items.filter((o) => seenStatus[o.order_no] === 'awaiting_quote' && o.status === 'quoted')

    const updatedStatus = { ...seenStatus }
    items.forEach((o) => {
      updatedStatus[o.order_no] = o.status
    })
    lastStatuses.current = updatedStatus
    writeJSON(STATUS_KEY, updatedStatus)

    const seenResults = lastResults.current
    const updatedResults = { ...seenResults }
    const newlyDelivered = []
    items.forEach((o) => {
      ;(o.items || []).forEach((it) => {
        const key = `${o.order_no}:${it.id}`
        if (seenResults[key] === false && it.has_result) {
          newlyDelivered.push({ order: o, item: it })
        }
        updatedResults[key] = Boolean(it.has_result)
      })
    })
    lastResults.current = updatedResults
    writeJSON(RESULT_KEY, updatedResults)

    const quoteEntries = newlyQuoted.map((o) => ({
      id: `quote-${o.order_no}-${Date.now()}`,
      orderNo: o.order_no,
      message: `Pesanan ${o.order_no} sudah diberi harga ${formatIDR(o.total)} — silakan lanjutkan pembayaran.`,
      timestamp: new Date().toISOString(),
      read: false,
    }))
    const resultEntries = newlyDelivered.map(({ order, item }) => ({
      id: `result-${order.order_no}-${item.id}-${Date.now()}`,
      orderNo: order.order_no,
      message: `Hasil untuk "${item.title_snapshot}" pada pesanan ${order.order_no} sudah siap — silakan unduh.`,
      timestamp: new Date().toISOString(),
      read: false,
    }))
    const entries = [...quoteEntries, ...resultEntries]

    if (entries.length === 0) return

    setNotifications((prev) => {
      const merged = [...entries, ...prev].slice(0, MAX_STORED)
      writeJSON(LIST_KEY, merged)
      return merged
    })

    setToast(entries.length === 1 ? entries[0].message : `Anda punya ${entries.length} notifikasi baru.`)
  }, [])

  useEffect(() => {
    if (!authReady || !user) return undefined
    checkForUpdates()
    const interval = setInterval(checkForUpdates, POLL_MS)
    return () => clearInterval(interval)
  }, [authReady, user, checkForUpdates])

  // Auto-dismiss the toast.
  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  const markAllRead = useCallback(() => {
    setNotifications((prev) => {
      if (prev.every((n) => n.read)) return prev
      const updated = prev.map((n) => ({ ...n, read: true }))
      writeJSON(LIST_KEY, updated)
      return updated
    })
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  const value = {
    notifications,
    unreadCount,
    markAllRead,
    toast,
    dismissToast: () => setToast(null),
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}
