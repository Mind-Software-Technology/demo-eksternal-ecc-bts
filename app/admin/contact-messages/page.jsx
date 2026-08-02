'use client'

import { useEffect, useState } from 'react'
import { FiTrash2 } from 'react-icons/fi'
import { api } from '../../../lib/api'

const fmtDate = (iso) =>
  new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(
    new Date(iso),
  )

export default function AdminContactMessagesPage() {
  const [page, setPage] = useState(1)
  const [items, setItems] = useState(null)
  const [meta, setMeta] = useState(null)
  const [error, setError] = useState(null)

  const refresh = () =>
    api.admin.contactMessages
      .list({ page })
      .then(({ items, meta }) => {
        setItems(items)
        setMeta(meta)
      })
      .catch((e) => setError(e.message))

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset to loading state before refetch on page change
    setItems(null)
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch on page change only
  }, [page])

  const onDelete = async (msg) => {
    if (!window.confirm('Hapus pesan ini?')) return
    try {
      await api.admin.contactMessages.remove(msg.id)
      refresh()
    } catch (err) {
      setError(err.message || 'Gagal menghapus pesan.')
    }
  }

  const totalPages = meta ? Math.max(1, Math.ceil(meta.total / meta.limit)) : 1

  return (
    <div>
      <div className="admin-page-head">
        <h1 className="admin-page-title">Pesan Kontak</h1>
      </div>

      {error && <p className="admin-form-error">{error}</p>}

      {items === null ? (
        <p className="empty-note">Memuat data…</p>
      ) : items.length === 0 ? (
        <p className="empty-note">Belum ada pesan.</p>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Pesan</th>
                  <th>Tanggal</th>
                  <th aria-label="Aksi" />
                </tr>
              </thead>
              <tbody>
                {items.map((m) => (
                  <tr key={m.id}>
                    <td>{m.name}</td>
                    <td>{m.email}</td>
                    <td className="admin-table__wrap-text">{m.message}</td>
                    <td>{fmtDate(m.created_at)}</td>
                    <td className="admin-table__actions">
                      <button type="button" onClick={() => onDelete(m)} aria-label="Hapus">
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="admin-pagination">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Sebelumnya
              </button>
              <span>
                Halaman {page} / {totalPages}
              </span>
              <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Berikutnya
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
