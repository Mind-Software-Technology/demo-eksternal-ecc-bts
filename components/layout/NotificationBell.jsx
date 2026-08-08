'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { FiBell } from 'react-icons/fi'
import { useNotifications } from '../../context/notifications'
import { formatEventDate } from '../../data/format'

/** Navbar bell — badge with unread count, dropdown with recent notifications
 *  (penawaran harga, hasil siap, kegiatan baru). Setiap notifikasi membawa
 *  `url` tujuannya sendiri dari backend. */
export default function NotificationBell() {
  const { notifications, unreadCount, markAllRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  const toggle = () => {
    setOpen((v) => {
      const next = !v
      if (next) markAllRead()
      return next
    })
  }

  return (
    <div className="navbar__notif" ref={rootRef}>
      <button
        type="button"
        className="navbar__notif-trigger"
        onClick={toggle}
        aria-expanded={open}
        aria-label={`Notifikasi${unreadCount ? `, ${unreadCount} belum dibaca` : ''}`}
      >
        <FiBell />
        {unreadCount > 0 && <span className="navbar__cart-badge">{unreadCount}</span>}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="navbar__notif-panel"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            <div className="navbar__notif-panel__head">
              <b>Notifikasi</b>
            </div>

            {notifications.length === 0 ? (
              <p className="navbar__notif-panel__empty">Belum ada notifikasi.</p>
            ) : (
              <ul className="navbar__notif-panel__list">
                {notifications.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={n.url || '/'}
                      className="navbar__notif-panel__item"
                      onClick={() => setOpen(false)}
                    >
                      <span>{n.message}</span>
                      <small>{formatEventDate(n.created_at)}</small>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
