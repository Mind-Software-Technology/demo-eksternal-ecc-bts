'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FiUsers, FiCheckCircle, FiStar, FiHeadphones, FiClock, FiMail } from 'react-icons/fi'
import { api } from '../../lib/api'
import { formatIDR } from '../../data/format'
import RevenueChart from '../../components/admin/RevenueChart'

const STAT_ICON = {
  klien_terlayani: FiUsers,
  order_selesai: FiCheckCircle,
  rating_kepuasan: FiStar,
  respon_cepat: FiHeadphones,
}

const STATUS_LABEL = {
  pending: 'Menunggu',
  awaiting_payment: 'Menunggu Pembayaran',
  paid: 'Berhasil',
  failed: 'Gagal',
  cancelled: 'Dibatalkan',
  expired: 'Kedaluwarsa',
}

const STATUS_BADGE = {
  paid: 'admin-badge--success',
  pending: 'admin-badge--warning',
  awaiting_payment: 'admin-badge--warning',
  failed: 'admin-badge--danger',
  cancelled: 'admin-badge--danger',
  expired: 'admin-badge--danger',
}

const fmtDate = (iso) =>
  new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso))

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [opsCounts, setOpsCounts] = useState(null)
  const [recentOrders, setRecentOrders] = useState(null)
  const [recentMessages, setRecentMessages] = useState(null)
  const [revenue, setRevenue] = useState(null)

  useEffect(() => {
    api.stats.list().then(setStats).catch(() => setStats([]))

    api.admin.analytics.revenue().then(setRevenue).catch(() => setRevenue([]))

    api.admin.orders
      .list({ limit: 5 })
      .then(({ items }) => setRecentOrders(items))
      .catch(() => setRecentOrders([]))

    api.admin.contactMessages
      .list({ limit: 4 })
      .then(({ items }) => setRecentMessages(items))
      .catch(() => setRecentMessages([]))

    Promise.all([
      api.admin.orders.list({ status: 'pending', limit: 1 }),
      api.admin.orders.list({ status: 'paid', limit: 1 }),
      api.admin.contactMessages.list({ limit: 1 }),
    ])
      .then(([pending, paid, messages]) => {
        setOpsCounts({ pending: pending.meta.total, paid: paid.meta.total, messages: messages.meta.total })
      })
      .catch(() => setOpsCounts({ pending: 0, paid: 0, messages: 0 }))
  }, [])

  return (
    <div>
      <div className="admin-page-head">
        <h1 className="admin-page-title">Dashboard</h1>
      </div>

      <div className="admin-stat-grid">
        {(stats || []).map((s) => {
          const Icon = STAT_ICON[s.id] || FiStar
          return (
            <div className="admin-stat-card" key={s.id}>
              <div className="admin-stat-card__body">
                <span className="admin-stat-card__value">
                  {s.value}
                  {s.suffix}
                </span>
                <span className="admin-stat-card__label">{s.label}</span>
              </div>
              <span className="admin-stat-card__icon">
                <Icon />
              </span>
            </div>
          )
        })}
        {stats === null && <p className="empty-note">Memuat statistik…</p>}
      </div>

      <h2 className="admin-section-title">Ringkasan Operasional</h2>
      <div className="admin-stat-grid">
        <div className="admin-stat-card admin-stat-card--orange">
          <div className="admin-stat-card__body">
            <span className="admin-stat-card__value">{opsCounts?.pending ?? '—'}</span>
            <span className="admin-stat-card__label">Pesanan Menunggu</span>
          </div>
          <span className="admin-stat-card__icon">
            <FiClock />
          </span>
        </div>
        <div className="admin-stat-card admin-stat-card--green">
          <div className="admin-stat-card__body">
            <span className="admin-stat-card__value">{opsCounts?.paid ?? '—'}</span>
            <span className="admin-stat-card__label">Pesanan Berhasil</span>
          </div>
          <span className="admin-stat-card__icon">
            <FiCheckCircle />
          </span>
        </div>
        <div className="admin-stat-card admin-stat-card--indigo">
          <div className="admin-stat-card__body">
            <span className="admin-stat-card__value">{opsCounts?.messages ?? '—'}</span>
            <span className="admin-stat-card__label">Pesan Kontak</span>
          </div>
          <span className="admin-stat-card__icon">
            <FiMail />
          </span>
        </div>
      </div>

      <h2 className="admin-section-title">Pendapatan 12 Bulan Terakhir</h2>
      <div className="admin-dashboard-grid">
        <div className="admin-widget admin-widget--chart">
          <div className="admin-widget__head">
            <h2>Tren Pendapatan</h2>
            {revenue?.length > 0 && (
              <span className="admin-table__muted">
                Total: <b>{formatIDR(revenue.reduce((sum, r) => sum + r.revenue, 0))}</b>
              </span>
            )}
          </div>
          {revenue === null ? (
            <p className="empty-note">Memuat grafik…</p>
          ) : revenue.every((r) => r.revenue === 0) ? (
            <p className="empty-note">Belum ada transaksi berhasil.</p>
          ) : (
            <RevenueChart data={revenue} />
          )}
        </div>
      </div>

      <h2 className="admin-section-title">Aktivitas Terbaru</h2>
      <div className="admin-dashboard-grid">
        <div className="admin-widget">
          <div className="admin-widget__head">
            <h2>Pesanan Terbaru</h2>
            <Link href="/admin/orders">Lihat semua</Link>
          </div>
          {recentOrders === null ? (
            <p className="empty-note">Memuat…</p>
          ) : recentOrders.length === 0 ? (
            <p className="empty-note">Belum ada pesanan.</p>
          ) : (
            <ul className="admin-recent-list">
              {recentOrders.map((o) => (
                <li key={o.id}>
                  <div className="admin-recent-list__main">
                    <Link href={`/admin/orders/${o.order_no}`}>{o.order_no}</Link>
                    <span>{o.guest_name}</span>
                  </div>
                  <div className="admin-recent-list__side">
                    <b>{formatIDR(o.total)}</b>
                    <span className={`admin-badge ${STATUS_BADGE[o.status] || ''}`}>
                      {STATUS_LABEL[o.status] || o.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="admin-widget">
          <div className="admin-widget__head">
            <h2>Pesan Kontak Terbaru</h2>
            <Link href="/admin/contact-messages">Lihat semua</Link>
          </div>
          {recentMessages === null ? (
            <p className="empty-note">Memuat…</p>
          ) : recentMessages.length === 0 ? (
            <p className="empty-note">Belum ada pesan.</p>
          ) : (
            <ul className="admin-recent-list">
              {recentMessages.map((m) => (
                <li key={m.id}>
                  <div className="admin-recent-list__main">
                    <strong>{m.name}</strong>
                    <span>{m.message}</span>
                  </div>
                  <div className="admin-recent-list__side">
                    <span className="admin-table__muted">{fmtDate(m.created_at)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
