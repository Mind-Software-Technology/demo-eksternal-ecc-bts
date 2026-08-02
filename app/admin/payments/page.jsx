'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '../../../lib/api'
import { formatIDR } from '../../../data/format'

const fmtDate = (iso) =>
  new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(
    new Date(iso),
  )

export default function AdminPaymentsPage() {
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [items, setItems] = useState(null)
  const [meta, setMeta] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset to loading state before refetch on filter/page change
    setItems(null)
    api.admin.payments
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
        <h1 className="admin-page-title">Pembayaran</h1>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            setPage(1)
          }}
          className="admin-filter-select"
        >
          <option value="">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="settlement">Settlement</option>
          <option value="capture">Capture</option>
          <option value="deny">Deny</option>
          <option value="cancel">Cancel</option>
          <option value="expire">Expire</option>
          <option value="failure">Failure</option>
        </select>
      </div>

      {error && <p className="admin-form-error">{error}</p>}

      {items === null ? (
        <p className="empty-note">Memuat data…</p>
      ) : items.length === 0 ? (
        <p className="empty-note">Belum ada pembayaran.</p>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID (Midtrans)</th>
                  <th>Metode</th>
                  <th>Jumlah</th>
                  <th>Status</th>
                  <th>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Link href={`/admin/payments/${p.id}`}>{p.midtrans_order_id}</Link>
                    </td>
                    <td>{p.payment_type || '—'}</td>
                    <td>{formatIDR(p.gross_amount)}</td>
                    <td>{p.transaction_status}</td>
                    <td>{fmtDate(p.created_at)}</td>
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
