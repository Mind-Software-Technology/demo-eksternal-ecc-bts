'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
} from 'react-icons/fi'
import { useAuth } from '../../context/auth'
import GoogleSignInButton from './GoogleSignInButton'

/** Shared login/register form, rendered on the dedicated /login and /daftar pages. */
export default function AuthForm({ mode }) {
  const { user, ready, login, register } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const redirectTo = searchParams.get('redirect') || '/'
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  // Already logged in — this page is a dead end, bounce onward.
  useEffect(() => {
    if (ready && user) router.replace(redirectTo)
  }, [ready, user, redirectTo, router])

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
      router.push(redirectTo)
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan. Coba lagi.')
    } finally {
      setBusy(false)
    }
  }

  const switchHref = mode === 'login'
    ? `/daftar${redirectTo !== '/' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`
    : `/login${redirectTo !== '/' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`

  if (ready && user) return null

  return (
    <motion.div
      className="auth-card"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="auth-card__form">
        <h1 className="auth-card__title">{mode === 'login' ? 'Masuk' : 'Buat Akun Baru'}</h1>
        <p className="auth-card__subtitle">
          {mode === 'login'
            ? 'Masuk untuk melanjutkan pesanan dan melihat riwayat Anda.'
            : 'Daftar gratis dan mulai kelola pesanan karya ilmiah Anda.'}
        </p>

        {error && (
          <p className="auth-modal__error">
            <FiAlertCircle />
            <span>{error}</span>
          </p>
        )}

        <form onSubmit={onSubmit} noValidate>
          {mode === 'register' && (
            <div className="field field--icon">
              <label htmlFor="auth-name">Nama Lengkap</label>
              <div className="field__control">
                <FiUser className="field__icon" />
                <input
                  id="auth-name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={update}
                  placeholder="Nama Anda"
                  autoComplete="name"
                />
              </div>
            </div>
          )}
          <div className="field field--icon">
            <label htmlFor="auth-email">Email</label>
            <div className="field__control">
              <FiMail className="field__icon" />
              <input
                id="auth-email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={update}
                placeholder="email@contoh.com"
                autoComplete="email"
              />
            </div>
          </div>
          {mode === 'register' && (
            <div className="field field--icon">
              <label htmlFor="auth-phone">No. HP (opsional)</label>
              <div className="field__control">
                <FiPhone className="field__icon" />
                <input
                  id="auth-phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={update}
                  placeholder="08xx-xxxx-xxxx"
                  autoComplete="tel"
                />
              </div>
            </div>
          )}
          <div className="field field--icon">
            <label htmlFor="auth-password">Kata Sandi</label>
            <div className="field__control">
              <FiLock className="field__icon" />
              <input
                id="auth-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={form.password}
                onChange={update}
                placeholder="Minimal 8 karakter"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                className="field__toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn--primary btn--block btn--lg" disabled={busy}>
            {busy ? 'Memproses…' : mode === 'login' ? 'Masuk' : 'Daftar'}
          </button>
        </form>

        <div className="auth-modal__divider">
          <span>atau</span>
        </div>

        <GoogleSignInButton onError={setError} onSuccess={() => router.push(redirectTo)} />

        <p className="auth-modal__switch">
          {mode === 'login' ? (
            <>
              Belum punya akun? <Link href={switchHref}>Daftar</Link>
            </>
          ) : (
            <>
              Sudah punya akun? <Link href={switchHref}>Masuk</Link>
            </>
          )}
        </p>
      </div>
    </motion.div>
  )
}
