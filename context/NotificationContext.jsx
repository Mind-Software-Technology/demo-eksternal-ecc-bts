'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '../lib/api'
import { formatIDR } from '../data/format'
import { NotificationContext } from './notifications'
import { useAuth } from './auth'

// ───────────────────────────────────────────────────────────────────────────
// Site-wide notifications: polls the customer's orders in the background so
// they find out about admin activity — pricing an order (awaiting_quote →
// quoted) or delivering a result file (has_result false → true) — no matter
// which page they're on.
//
// This is also the single source of truth for the order list itself
// (/riwayat-pembayaran reads `orders` from here instead of running its own
// poll — same endpoint, no reason to fetch it twice).
//
// Setiap update memicu tiga hal: lonceng di navbar, toast dalam halaman, dan
// (kalau diizinkan) popup Chrome/OS lewat Notification API.
//
// ponytail: popup hanya hidup selama situs terbuka di suatu tab — Notification
// API memang begitu. Kalau nanti perlu notifikasi saat situs benar-benar
// ditutup, itu Web Push: service worker + kunci VAPID + tabel langganan push
// + endpoint pengirim di Laravel. Jauh lebih besar, dan butuh backend.
// ───────────────────────────────────────────────────────────────────────────

const POLL_MS = 2000
// Tab di background tidak perlu 2 detik, tapi juga tidak boleh mati total —
// notifikasi desktop justru paling berguna saat pelanggan sedang di tab lain.
// Tiap tick ke-15 ≈ 30 detik, jadi ~120 request/jam alih-alih 1800.
const BACKGROUND_EVERY = 15
const MAX_STORED = 20
const STATUS_KEY = 'ecc-bts-order-status-seen'
const RESULT_KEY = 'ecc-bts-order-item-result-seen'
const LIST_KEY = 'ecc-bts-notifications'

const supportsDesktopNotifications = () =>
  typeof window !== 'undefined' && 'Notification' in window

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
  const router = useRouter()
  const [notifications, setNotifications] = useState([])
  const [toast, setToast] = useState(null)
  // null = belum pernah berhasil dimuat (dipakai /riwayat-pembayaran untuk
  // membedakan "sedang memuat" dari "memang kosong").
  const [orders, setOrders] = useState(null)
  const [ordersError, setOrdersError] = useState(null)
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

  const refreshOrders = useCallback(async () => {
    let items
    try {
      ;({ items } = await api.orders.list())
      setOrdersError(null)
    } catch (e) {
      setOrdersError(e.message || 'Gagal memuat pesanan.')
      return
    }
    setOrders(items)

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

    // Popup Chrome/OS di luar halaman — inilah yang sampai ke pelanggan saat
    // tab ECC-BTS tidak sedang dilihat.
    if (supportsDesktopNotifications() && Notification.permission === 'granted') {
      entries.forEach((entry) => {
        // `tag` per pesanan: update berikutnya untuk pesanan yang sama
        // menggantikan popup lama, bukan menumpuk.
        const popup = new Notification('ECC-BTS', {
          body: entry.message,
          icon: '/images/logo.png',
          tag: entry.orderNo,
        })
        popup.onclick = () => {
          window.focus()
          popup.close()
          router.push('/riwayat-pembayaran')
        }
      })
    }
  }, [router])

  useEffect(() => {
    if (!authReady) return undefined
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- drops the previous account's orders on logout
      setOrders(null)
      return undefined
    }
    refreshOrders()
    let tick = 0
    const interval = setInterval(() => {
      tick += 1
      if (!document.hidden || tick % BACKGROUND_EVERY === 0) refreshOrders()
    }, POLL_MS)
    return () => clearInterval(interval)
  }, [authReady, user, refreshOrders])

  // Izin notifikasi diminta hanya setelah pelanggan login — merekalah yang
  // punya pesanan untuk dinotifikasi. Meminta ke pengunjung anonim membakar
  // kesempatan yang cuma sekali: begitu ditolak, browser tidak akan pernah
  // menampilkan prompt itu lagi (harus lewat setelan situs).
  useEffect(() => {
    if (!user || !supportsDesktopNotifications()) return
    if (Notification.permission !== 'default') return
    Notification.requestPermission().catch(() => {
      /* browser menolak prompt (mis. mode senyap Chrome) — lonceng tetap jalan */
    })
  }, [user])

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
    orders,
    ordersError,
    refreshOrders,
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}
