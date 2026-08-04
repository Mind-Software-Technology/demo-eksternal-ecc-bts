'use client'

import { useEffect, useState } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { api } from '../../../lib/api'

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState(null)
  const [error, setError] = useState(null)

  const refresh = () =>
    api.admin.testimonials
      .list()
      .then(setItems)
      .catch((e) => setError(e.message))

  useEffect(() => {
    refresh()
  }, [])

  const onToggle = async (t) => {
    try {
      await api.admin.testimonials.toggleActive(t.id)
      refresh()
    } catch (err) {
      setError(err.message || 'Gagal mengubah status.')
    }
  }

  return (
    <div>
      <div className="admin-page-head">
        <h1 className="admin-page-title">Testimoni</h1>
      </div>

      <p className="admin-page-note">
        Testimoni dikirim langsung oleh pelanggan setelah hasil pesanannya selesai — admin hanya bisa
        menampilkan/menyembunyikan, tidak bisa menambah, mengubah, atau menghapus isinya.
      </p>

      {error && <p className="admin-form-error">{error}</p>}

      {items === null ? (
        <p className="empty-note">Memuat data…</p>
      ) : items.length === 0 ? (
        <p className="empty-note">Belum ada testimoni.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Peran</th>
                <th>Order</th>
                <th>Rating</th>
                <th>Testimoni</th>
                <th>Status</th>
                <th aria-label="Aksi" />
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td>{t.role}</td>
                  <td>{t.order_no || '—'}</td>
                  <td>{t.rating}</td>
                  <td className="admin-table__wrap-text">{t.text}</td>
                  <td>
                    <span className={`admin-badge ${t.is_active ? 'admin-badge--success' : ''}`}>
                      {t.is_active ? 'Tampil' : 'Disembunyikan'}
                    </span>
                  </td>
                  <td className="admin-table__actions">
                    <button
                      type="button"
                      onClick={() => onToggle(t)}
                      aria-label={t.is_active ? 'Sembunyikan' : 'Tampilkan'}
                      title={t.is_active ? 'Sembunyikan dari situs publik' : 'Tampilkan di situs publik'}
                    >
                      {t.is_active ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
