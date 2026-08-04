'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiDownload, FiUpload, FiFileText } from 'react-icons/fi'
import { api } from '../../../../lib/api'
import { formatIDR } from '../../../../data/format'

const STATUS_LABEL = {
  awaiting_quote: 'Menunggu Penawaran',
  quoted: 'Menunggu Persetujuan',
  pending: 'Menunggu',
  awaiting_payment: 'Menunggu Pembayaran',
  paid: 'Berhasil',
  failed: 'Gagal',
  cancelled: 'Dibatalkan',
  expired: 'Kedaluwarsa',
}

// Harus selaras dengan validasi backend (Admin\OrderController::uploadResult).
const RESULT_ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png']
const RESULT_MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB, sama dengan max:10240 di backend

const isImageFile = (filename) => /\.(jpe?g|png)$/i.test(filename || '')

function ResultCell({ order, item, onUploaded }) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const onPick = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setError(null)
    setSuccess(null)

    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!RESULT_ALLOWED_EXTENSIONS.includes(extension)) {
      setError(`Tipe file .${extension} tidak didukung. Gunakan: ${RESULT_ALLOWED_EXTENSIONS.join(', ')}.`)
      return
    }
    if (file.size > RESULT_MAX_SIZE_BYTES) {
      setError('Ukuran file maksimal 10 MB.')
      return
    }
    if (item.has_result && !window.confirm(`Hasil sebelumnya (${item.result_original_name}) akan diganti dan dihapus permanen. Lanjutkan?`)) {
      return
    }

    setBusy(true)
    try {
      await api.admin.orders.uploadResult(order.order_no, item.id, file)
      setSuccess(item.has_result ? 'Hasil berhasil diperbarui.' : 'Hasil berhasil diunggah.')
      onUploaded()
    } catch (err) {
      setError(err.message || 'Gagal mengunggah hasil.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-result-cell">
      {item.has_result && (
        <a href={api.admin.orders.resultUrl(order.order_no, item.id)} target="_blank" rel="noopener" className="admin-file-link">
          <FiDownload /> {item.result_original_name}
        </a>
      )}
      <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className="admin-upload-btn">
        <FiUpload /> {busy ? 'Mengunggah…' : item.has_result ? 'Ganti Hasil' : 'Unggah Hasil'}
      </button>
      <input ref={inputRef} type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" hidden onChange={onPick} />
      {error && <span className="admin-form-error admin-form-error--inline">{error}</span>}
      {success && <span className="admin-form-success admin-form-success--inline">{success}</span>}
    </div>
  )
}

export default function AdminOrderDetailPage() {
  const { order_no } = useParams()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState(null)
  const [prices, setPrices] = useState({})
  const [quoteBusy, setQuoteBusy] = useState(false)
  const [quoteError, setQuoteError] = useState(null)

  const refresh = () =>
    api.admin.orders
      .show(order_no)
      .then((data) => {
        setOrder(data)
        setPrices(Object.fromEntries(data.items.map((it) => [it.id, it.price_snapshot ?? ''])))
      })
      .catch((e) => setError(e.message))

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch once per order_no
  }, [order_no])

  if (error) return <p className="admin-form-error">{error}</p>
  if (!order) return <p className="empty-note">Memuat data…</p>

  const canQuote = order.status === 'awaiting_quote' || order.status === 'quoted'

  const submitQuote = async (e) => {
    e.preventDefault()
    setQuoteError(null)
    const items = order.items.map((item) => ({ id: item.id, price: Number(prices[item.id]) }))
    if (items.some((it) => !Number.isFinite(it.price) || it.price < 0)) {
      setQuoteError('Isi harga (angka, minimal 0) untuk setiap layanan sebelum mengirim penawaran.')
      return
    }
    setQuoteBusy(true)
    try {
      await api.admin.orders.submitQuote(order.order_no, items)
      await refresh()
    } catch (err) {
      setQuoteError(err.message || 'Gagal mengirim penawaran.')
    } finally {
      setQuoteBusy(false)
    }
  }

  return (
    <div>
      <Link href="/admin/orders" className="admin-back-link">
        <FiArrowLeft /> Kembali ke daftar pesanan
      </Link>

      <div className="admin-page-head">
        <h1 className="admin-page-title">Pesanan {order.order_no}</h1>
      </div>

      <div className="admin-order-summary">
        <div>
          <span className="admin-table__muted">Pelanggan</span>
          <p>
            {order.guest_name} — {order.guest_email}
            {order.guest_phone ? ` — ${order.guest_phone}` : ''}
          </p>
        </div>
        <div>
          <span className="admin-table__muted">Status</span>
          <p>{STATUS_LABEL[order.status] || order.status}</p>
        </div>
        <div>
          <span className="admin-table__muted">Total</span>
          <p>{order.total != null ? formatIDR(order.total) : 'Belum ditentukan'}</p>
        </div>
      </div>

      <form onSubmit={submitQuote}>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Layanan</th>
                <th>Qty</th>
                <th>{canQuote ? 'Harga (per satuan)' : 'Harga'}</th>
                <th>File Pelanggan</th>
                <th>Hasil</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.title_snapshot}</td>
                  <td>{item.qty}</td>
                  <td>
                    {canQuote ? (
                      <input
                        type="number"
                        min="0"
                        required
                        value={prices[item.id] ?? ''}
                        onChange={(e) => setPrices((p) => ({ ...p, [item.id]: e.target.value }))}
                        className="admin-price-input"
                      />
                    ) : item.line_total != null ? (
                      formatIDR(item.line_total)
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    {item.has_attachment ? (
                      <div className="admin-result-cell">
                        {isImageFile(item.attachment_original_name) && (
                          <img
                            src={api.admin.orders.attachmentUrl(order.order_no, item.id)}
                            alt=""
                            className="admin-attachment-thumb"
                          />
                        )}
                        <a
                          href={api.admin.orders.attachmentUrl(order.order_no, item.id)}
                          target="_blank"
                          rel="noopener"
                          className="admin-file-link"
                        >
                          {isImageFile(item.attachment_original_name) ? <FiFileText /> : <FiDownload />} Lihat File
                        </a>
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    <ResultCell order={order} item={item} onUploaded={refresh} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {canQuote && (
          <div className="admin-quote-actions">
            {quoteError && <p className="admin-form-error">{quoteError}</p>}
            <button type="submit" className="btn btn--primary btn--sm" disabled={quoteBusy}>
              {quoteBusy ? 'Mengirim…' : order.status === 'quoted' ? 'Perbarui Penawaran' : 'Kirim Penawaran'}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
