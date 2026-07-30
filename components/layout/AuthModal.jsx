'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FiX } from 'react-icons/fi'
import { useAuth } from '../../context/auth'

/** Login / register modal — opened from the Navbar's auth buttons. */
export default function AuthModal({ mode: initialMode, onClose }) {
  const { login, register } = useAuth()
  const [mode, setMode] = useState(initialMode || 'login')
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password })
      } else {
        await register({
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          password: form.password,
        })
      }
      onClose()
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan. Coba lagi.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        className="drawer-overlay"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        key="modal"
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <button type="button" className="auth-modal__close" aria-label="Tutup" onClick={onClose}>
          <FiX />
        </button>

        <h2 className="auth-modal__title">{mode === 'login' ? 'Masuk' : 'Daftar Akun'}</h2>

        {error && <p className="auth-modal__error">{error}</p>}

        <form onSubmit={onSubmit} noValidate>
          {mode === 'register' && (
            <div className="field">
              <label htmlFor="auth-name">Nama Lengkap</label>
              <input
                id="auth-name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={update}
                placeholder="Nama Anda"
              />
            </div>
          )}
          <div className="field">
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={update}
              placeholder="email@contoh.com"
            />
          </div>
          {mode === 'register' && (
            <div className="field">
              <label htmlFor="auth-phone">No. HP (opsional)</label>
              <input
                id="auth-phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={update}
                placeholder="08xx-xxxx-xxxx"
              />
            </div>
          )}
          <div className="field">
            <label htmlFor="auth-password">Kata Sandi</label>
            <input
              id="auth-password"
              name="password"
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={update}
              placeholder="Minimal 8 karakter"
            />
          </div>

          <button type="submit" className="btn btn--primary btn--block btn--lg" disabled={busy}>
            {busy ? 'Memproses…' : mode === 'login' ? 'Masuk' : 'Daftar'}
          </button>
        </form>

        <p className="auth-modal__switch">
          {mode === 'login' ? (
            <>
              Belum punya akun?{' '}
              <button type="button" onClick={() => setMode('register')}>
                Daftar
              </button>
            </>
          ) : (
            <>
              Sudah punya akun?{' '}
              <button type="button" onClick={() => setMode('login')}>
                Masuk
              </button>
            </>
          )}
        </p>
      </motion.div>
    </AnimatePresence>
  )
}
