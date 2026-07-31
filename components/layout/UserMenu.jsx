'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FiUser, FiChevronDown, FiLogOut, FiAlertCircle } from 'react-icons/fi'
import { useAuth } from '../../context/auth'

/** Collapses the logged-in navbar state (name + verify prompt + logout) into one dropdown. */
export default function UserMenu() {
  const { user, logout, resendVerification } = useAuth()
  const [open, setOpen] = useState(false)
  const [verifySent, setVerifySent] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  const onResendVerification = async () => {
    try {
      await resendVerification()
      setVerifySent(true)
    } catch {
      /* silently ignore — user can retry */
    }
  }

  return (
    <div className="navbar__user" ref={rootRef}>
      <button
        type="button"
        className="navbar__user-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <FiUser />
        <span>{user.name}</span>
        {!user.email_verified && <span className="navbar__user-dot" aria-hidden="true" />}
        <FiChevronDown className="navbar__user-chevron" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="navbar__user-menu"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            <div className="navbar__user-menu__head">
              <b>{user.name}</b>
              <span>{user.email}</span>
            </div>

            {!user.email_verified && (
              <button
                type="button"
                className="navbar__user-menu__verify"
                onClick={onResendVerification}
                disabled={verifySent}
              >
                <FiAlertCircle />
                {verifySent ? 'Link verifikasi terkirim' : 'Email belum diverifikasi — kirim ulang link'}
              </button>
            )}

            <button
              type="button"
              className="navbar__user-menu__logout"
              onClick={() => {
                setOpen(false)
                logout()
              }}
            >
              <FiLogOut /> Keluar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
