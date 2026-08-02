'use client'

import { useEffect, useState } from 'react'
import { api } from '../../../lib/api'

const TEXT_FIELDS = [
  { name: 'brand_name', label: 'Nama Brand' },
  { name: 'logo_url', label: 'URL Logo' },
  { name: 'contact_email', label: 'Email Kontak', type: 'email' },
  { name: 'contact_phone', label: 'No. Telepon' },
  { name: 'address', label: 'Alamat' },
  { name: 'bank_name', label: 'Nama Bank' },
  { name: 'bank_account_number', label: 'No. Rekening' },
  { name: 'bank_account_holder', label: 'Nama Pemilik Rekening' },
]

export default function AdminSiteConfigPage() {
  const [form, setForm] = useState(null)
  const [jsonFields, setJsonFields] = useState({ social_links: '{}', nav_items: '[]' })
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api.siteConfig.show().then((data) => {
      const { social_links, nav_items, ...rest } = data
      setForm(rest)
      setJsonFields({
        social_links: JSON.stringify(social_links ?? {}, null, 2),
        nav_items: JSON.stringify(nav_items ?? [], null, 2),
      })
    })
  }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSaved(false)
    setBusy(true)
    try {
      const payload = { ...form }
      for (const key of Object.keys(payload)) {
        if (payload[key] === '') payload[key] = null
      }
      try {
        payload.social_links = JSON.parse(jsonFields.social_links)
        payload.nav_items = JSON.parse(jsonFields.nav_items)
      } catch {
        throw new Error('Format JSON di "Social Links" atau "Nav Items" tidak valid.')
      }
      await api.siteConfig.update(payload)
      setSaved(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (!form) return <p className="empty-note">Memuat konfigurasi…</p>

  return (
    <div>
      <div className="admin-page-head">
        <h1 className="admin-page-title">Konfigurasi Situs</h1>
      </div>

      {error && <p className="admin-form-error">{error}</p>}
      {saved && <p className="admin-form-success">Konfigurasi tersimpan.</p>}

      <form onSubmit={onSubmit} className="admin-site-config-form">
        {TEXT_FIELDS.map((f) => (
          <div className="field" key={f.name}>
            <label htmlFor={f.name}>{f.label}</label>
            <input
              id={f.name}
              type={f.type || 'text'}
              value={form[f.name] ?? ''}
              onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
            />
          </div>
        ))}

        <div className="field field--full">
          <label htmlFor="social_links">Social Links (JSON)</label>
          <textarea
            id="social_links"
            rows={4}
            value={jsonFields.social_links}
            onChange={(e) => setJsonFields({ ...jsonFields, social_links: e.target.value })}
          />
        </div>

        <div className="field field--full">
          <label htmlFor="nav_items">Nav Items (JSON)</label>
          <textarea
            id="nav_items"
            rows={6}
            value={jsonFields.nav_items}
            onChange={(e) => setJsonFields({ ...jsonFields, nav_items: e.target.value })}
          />
        </div>

        <button type="submit" className="btn btn--primary field--full" disabled={busy}>
          {busy ? 'Menyimpan…' : 'Simpan'}
        </button>
      </form>
    </div>
  )
}
