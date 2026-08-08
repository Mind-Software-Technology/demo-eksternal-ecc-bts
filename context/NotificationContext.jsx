'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '../lib/api'
import { NotificationContext } from './notifications'
import { useAuth } from './auth'
import { pushSupported, subscribeToPush } from '../lib/push'

// ───────────────────────────────────────────────────────────────────────────
// Notifikasi pelanggan, tiga lapis dari satu sumber (tabel `notifications`
// Laravel):
//
//   1. Web push — service worker (public/sw.js) memunculkan popup OS bahkan
//      ketika situs sudah ditutup sepenuhnya. Ini jalur utamanya.
//   2. Polling di sini — mengisi lonceng navbar + toast dalam halaman, dan
//      jadi cadangan untuk pelanggan yang menolak izin notifikasi.
//   3. Notification API biasa — hanya dipakai kalau langganan push gagal
//      dibuat, supaya popup tidak muncul dobel dengan yang dari service worker.
// ───────────────────────────────────────────────────────────────────────────

const POLL_MS = 2000
// Tab di background di-poll lebih jarang (~30 detik). Push sudah menangani
// pengiriman instan, jadi polling di sana cuma penyelaras lonceng.
const BACKGROUND_EVERY = 15

export function NotificationProvider({ children }) {
  const { user, ready: authReady } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [toast, setToast] = useState(null)

  // Ref, bukan state: dibaca di dalam refresh() dan tidak boleh membuat
  // callback-nya dibuat ulang tiap kali statusnya berubah.
  const pushActive = useRef(false)
  // null = belum pernah poll. Poll pertama hanya mencatat apa yang sudah ada;
  // tanpa itu, membuka situs akan memunculkan popup untuk semua notifikasi lama.
  const seenIds = useRef(null)

  const refresh = useCallback(async () => {
    let payload
    try {
      payload = await api.notifications.list()
    } catch {
      return
    }

    const items = payload.data || []
    setNotifications(items)
    setUnreadCount(payload.unread_count || 0)

    const known = seenIds.current
    seenIds.current = new Set(items.map((n) => n.id))
    if (known === null) return

    const fresh = items.filter((n) => !n.read && !known.has(n.id))
    if (fresh.length === 0) return

    setToast(
      fresh.length === 1 ? fresh[0].message : `Anda punya ${fresh.length} notifikasi baru.`,
    )

    // Kalau push aktif, service worker sudah memunculkan popup-nya sendiri.
    if (pushActive.current || !pushSupported() || Notification.permission !== 'granted') return

    fresh.forEach((entry) => {
      const popup = new Notification('ECC-BTS', {
        body: entry.message,
        icon: '/images/logo.png',
        tag: entry.id,
      })
      popup.onclick = () => {
        window.focus()
        popup.close()
        router.push(entry.url || '/')
      }
    })
  }, [router])

  useEffect(() => {
    if (!authReady) return undefined
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- membuang notifikasi akun sebelumnya saat logout
      setNotifications([])
      setUnreadCount(0)
      seenIds.current = null
      pushActive.current = false
      return undefined
    }

    refresh()
    let tick = 0
    const interval = setInterval(() => {
      tick += 1
      if (!document.hidden || tick % BACKGROUND_EVERY === 0) refresh()
    }, POLL_MS)
    return () => clearInterval(interval)
  }, [authReady, user, refresh])

  // Izin diminta setelah login, bukan ke pengunjung anonim: merekalah yang
  // punya pesanan dan kegiatan untuk dinotifikasi, dan prompt itu cuma sekali
  // seumur origin — sekali ditolak browser tidak menawarkannya lagi.
  useEffect(() => {
    if (!user || !pushSupported()) return undefined

    let cancelled = false
    const enable = async () => {
      if (Notification.permission === 'default') {
        try {
          await Notification.requestPermission()
        } catch {
          return
        }
      }
      if (cancelled || Notification.permission !== 'granted') return
      pushActive.current = await subscribeToPush()
    }
    enable()

    return () => {
      cancelled = true
    }
  }, [user])

  // Auto-dismiss the toast.
  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  const markAllRead = useCallback(async () => {
    if (unreadCount === 0) return
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
    try {
      await api.notifications.markAllRead()
    } catch {
      // Gagal disimpan — poll berikutnya akan mengembalikan hitungan yang benar.
    }
  }, [unreadCount])

  const value = {
    notifications,
    unreadCount,
    markAllRead,
    toast,
    dismissToast: () => setToast(null),
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}
