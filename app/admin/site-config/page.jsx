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

const SOCIAL_FIELDS = [
  { key: 'instagram', label: 'Instagram' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'whatsapp', label: 'WhatsApp (link wa.me)' },
]

export default function AdminSiteConfigPage() {
  const [form, setForm] = useState(null)
  const [socialLinks, setSocialLinks] = useState({})
  const [navItems, setNavItems] = useState([])
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api.siteConfig.show().then((data) => {
      const { social_links, nav_items, ...rest } = data
      setForm(rest)
      setSocialLinks(social_links ?? {})
      setNavItems(nav_items?.length ? nav_items : [{ label: '', path: '' }])
    })
  }, [])

  const updateNavItem = (index, key, value) => {
    setNavItems(navItems.map((item, i) => (i === index ? { ...item, [key]: value } : item)))
  }

  const removeNavItem = (index) => {
    setNavItems(navItems.filter((_, i) => i !== index))
  }

  const addNavItem = () => {
    setNavItems([...navItems, { label: '', path: '' }])
  }

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
      payload.social_links = Object.fromEntries(
        Object.entries(socialLinks).filter(([, url]) => url?.trim())
      )
      payload.nav_items = navItems.filter((n) => n.label?.trim() && n.path?.trim())
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
          <label>Media Sosial</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.75rem' }}>
            {SOCIAL_FIELDS.map((s) => (
              <div className="field" key={s.key}>
                <label htmlFor={`social_${s.key}`}>{s.label}</label>
                <input
                  id={`social_${s.key}`}
                  type="url"
                  placeholder="https://..."
                  value={socialLinks[s.key] ?? ''}
                  onChange={(e) => setSocialLinks({ ...socialLinks, [s.key]: e.target.value })}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="field field--full">
          <label>Menu Navigasi</label>
          {navItems.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                placeholder="Label (mis. Beranda)"
                value={item.label}
                onChange={(e) => updateNavItem(i, 'label', e.target.value)}
              />
              <input
                placeholder="Path (mis. /kategori)"
                value={item.path}
                onChange={(e) => updateNavItem(i, 'path', e.target.value)}
              />
              <button type="button" className="btn btn--outline btn--sm" onClick={() => removeNavItem(i)}>
                Hapus
              </button>
            </div>
          ))}
          <button type="button" className="btn btn--ghost btn--sm" onClick={addNavItem}>
            + Tambah Menu
          </button>
        </div>

        <button type="submit" className="btn btn--primary field--full" disabled={busy}>
          {busy ? 'Menyimpan…' : 'Simpan'}
        </button>
      </form>
    </div>
  )
}
