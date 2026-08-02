'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft } from 'react-icons/fi'
import { api } from '../../../../lib/api'
import { formatIDR } from '../../../../data/format'

const fmtDate = (iso) =>
  new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(
    new Date(iso),
  )

const FIELDS = [
  { key: 'midtrans_order_id', label: 'Order ID (Midtrans)' },
  { key: 'transaction_id', label: 'Transaction ID' },
  { key: 'payment_type', label: 'Metode Pembayaran' },
  { key: 'channel_detail', label: 'Detail Channel' },
  { key: 'gross_amount', label: 'Jumlah', render: (v) => formatIDR(v) },
  { key: 'transaction_status', label: 'Status Transaksi' },
  { key: 'fraud_status', label: 'Status Fraud' },
  { key: 'va_number', label: 'No. Virtual Account' },
  { key: 'payment_code', label: 'Kode Pembayaran' },
  { key: 'expiry_time', label: 'Kedaluwarsa', render: fmtDate },
  { key: 'paid_at', label: 'Dibayar Pada', render: fmtDate },
  { key: 'created_at', label: 'Dibuat Pada', render: fmtDate },
]

export default function AdminPaymentDetailPage() {
  const { id } = useParams()
  const [payment, setPayment] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.admin.payments.show(id).then(setPayment).catch((e) => setError(e.message))
  }, [id])

  if (error) return <p className="admin-form-error">{error}</p>
  if (!payment) return <p className="empty-note">Memuat data…</p>

  return (
    <div>
      <Link href="/admin/payments" className="admin-back-link">
        <FiArrowLeft /> Kembali ke daftar pembayaran
      </Link>

      <div className="admin-page-head">
        <h1 className="admin-page-title">Pembayaran #{payment.id}</h1>
      </div>

      <dl className="admin-detail-list">
        {FIELDS.map(({ key, label, render }) => (
          <div key={key}>
            <dt>{label}</dt>
            <dd>{payment[key] != null ? (render ? render(payment[key]) : payment[key]) : '—'}</dd>
          </div>
        ))}
      </dl>

      {(payment.qr_url || payment.deeplink_url) && (
        <div className="admin-detail-links">
          {payment.qr_url && (
            <a href={payment.qr_url} target="_blank" rel="noreferrer">
              Lihat QR Code
            </a>
          )}
          {payment.deeplink_url && (
            <a href={payment.deeplink_url} target="_blank" rel="noreferrer">
              Lihat Deeplink
            </a>
          )}
        </div>
      )}
    </div>
  )
}
