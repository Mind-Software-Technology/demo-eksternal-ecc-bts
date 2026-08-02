'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../../context/auth'
import GoogleSignInButton from './GoogleSignInButton'

/** Shared login/register form, rendered on the dedicated /login and /daftar pages. */
export default function AuthForm({ mode }) {
  const { user, ready, login, register } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const explicitRedirect = searchParams.get('redirect')
  const redirectTo = explicitRedirect || '/'
  const resolveRedirect = (u) => explicitRedirect || (u.role === 'admin' ? '/admin' : '/')
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  // Already logged in — this page is a dead end, bounce onward.
  useEffect(() => {
    if (ready && user) router.replace(resolveRedirect(user))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- resolveRedirect is derived from searchParams already in deps via explicitRedirect
  }, [ready, user, explicitRedirect, router])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      let u
      if (mode === 'login') {
        u = await login({ email: form.email, password: form.password })
      } else {
        u = await register({
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          password: form.password,
        })
      }
      router.push(resolveRedirect(u))
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
    <div className="auth-card">
      <h1 className="auth-card__title">{mode === 'login' ? 'Masuk' : 'Daftar Akun'}</h1>

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

      <div className="auth-modal__divider">
        <span>atau</span>
      </div>

      <GoogleSignInButton onError={setError} onSuccess={(u) => router.push(resolveRedirect(u))} />

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
  )
}
