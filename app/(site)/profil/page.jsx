'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import Page from '../../../components/layout/Page'
import PageHero from '../../../components/sections/PageHero'
import Reveal from '../../../components/ui/Reveal'
import { useAuth, loginUrl } from '../../../context/auth'

export default function Profile() {
  const { user, ready, updateProfile, resendVerification } = useAuth()
  const router = useRouter()

  const [form, setForm] = useState({ name: '', phone: '' })
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)
  const [verifySending, setVerifySending] = useState(false)
  const [verifySent, setVerifySent] = useState(false)

  useEffect(() => {
    if (ready && !user) router.replace(loginUrl('/profil'))
  }, [ready, user, router])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- prefills the form once the account loads, still user-editable
    if (user) setForm({ name: user.name || '', phone: user.phone || '' })
  }, [user])

  if (!ready || !user) return null

  const update = (e) => {
    setSaved(false)
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await updateProfile({ name: form.name, phone: form.phone || null })
      setSaved(true)
    } catch (err) {
      setError(err.message || 'Gagal menyimpan perubahan. Coba lagi.')
    } finally {
      setBusy(false)
    }
  }

  const onResendVerification = async () => {
    setVerifySending(true)
    try {
      await resendVerification()
      setVerifySent(true)
    } catch {
      /* silently ignore — user can retry */
    } finally {
      setVerifySending(false)
    }
  }

  return (
    <Page title="Profil Saya — ECC-BTS">
      <PageHero
        title="Profil Saya"
        crumb="Profil"
        subtitle="Kelola nama dan nomor WhatsApp yang digunakan untuk pesanan Anda."
      />

      <section className="section">
        <div className="container profile-page">
          <Reveal>
            <div
              className={`profile-verify ${user.email_verified ? 'profile-verify--ok' : 'profile-verify--pending'}`}
            >
              <span className="profile-verify__label">
                {user.email_verified ? <FiCheckCircle /> : <FiAlertCircle />}
                {user.email_verified
                  ? 'Email terverifikasi'
                  : 'Email belum diverifikasi'}
              </span>
              {!user.email_verified && (
                <button
                  type="button"
                  className="profile-verify__action"
                  onClick={onResendVerification}
                  disabled={verifySending || verifySent}
                >
                  {verifySent
                    ? 'Link terkirim'
                    : verifySending
                      ? 'Mengirim…'
                      : 'Kirim ulang link verifikasi'}
                </button>
              )}
            </div>

            <div className="form-card">
              {saved && (
                <div className="form__success">
                  <FiCheckCircle />
                  <span>Perubahan profil berhasil disimpan.</span>
                </div>
              )}
              {error && <p className="auth-modal__error">{error}</p>}

              <form onSubmit={onSubmit} noValidate>
                <div className="field">
                  <label htmlFor="profile-email">Email</label>
                  <input id="profile-email" type="email" value={user.email} disabled />
                </div>
                <div className="field--row">
                  <div className="field">
                    <label htmlFor="profile-name">Nama Lengkap</label>
                    <input
                      id="profile-name"
                      name="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={update}
                      placeholder="Nama Anda"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="profile-phone">No. WhatsApp</label>
                    <input
                      id="profile-phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={update}
                      placeholder="08xx-xxxx-xxxx"
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn--primary btn--lg" disabled={busy}>
                  {busy ? 'Menyimpan…' : 'Simpan Perubahan'}
                </button>
                <p className="form__note">Email tidak dapat diubah.</p>
              </form>
            </div>
          </Reveal>
        </div>
      </section>
    </Page>
  )
}
