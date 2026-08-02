'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '../../../lib/api'
import { formatIDR } from '../../../data/format'

const STATUS_LABEL = {
  pending: 'Menunggu',
  awaiting_payment: 'Menunggu Pembayaran',
  paid: 'Berhasil',
  failed: 'Gagal',
  cancelled: 'Dibatalkan',
  expired: 'Kedaluwarsa',
}

const fmtDate = (iso) =>
  new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso))

export default function AdminOrdersPage() {
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [items, setItems] = useState(null)
  const [meta, setMeta] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset to loading state before refetch on filter/page change
    setItems(null)
    api.admin.orders
      .list({ status: status || undefined, page })
      .then(({ items, meta }) => {
        setItems(items)
        setMeta(meta)
      })
      .catch((e) => setError(e.message))
  }, [status, page])

  const totalPages = meta ? Math.max(1, Math.ceil(meta.total / meta.limit)) : 1

  return (
    <div>
      <div className="admin-page-head">
        <h1 className="admin-page-title">Pesanan</h1>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            setPage(1)
          }}
          className="admin-filter-select"
        >
          <option value="">Semua Status</option>
          {Object.entries(STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="admin-form-error">{error}</p>}

      {items === null ? (
        <p className="empty-note">Memuat data…</p>
      ) : items.length === 0 ? (
        <p className="empty-note">Belum ada pesanan.</p>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>No. Pesanan</th>
                  <th>Pelanggan</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {items.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <Link href={`/admin/orders/${o.order_no}`}>{o.order_no}</Link>
                    </td>
                    <td>
                      {o.guest_name}
                      <br />
                      <span className="admin-table__muted">{o.guest_email}</span>
                    </td>
                    <td>{STATUS_LABEL[o.status] || o.status}</td>
                    <td>{formatIDR(o.total)}</td>
                    <td>{fmtDate(o.created_at)}</td>
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
