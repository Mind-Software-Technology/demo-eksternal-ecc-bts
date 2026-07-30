'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiArrowRight,
  FiFileText,
} from 'react-icons/fi'
import Page from '../../../components/layout/Page'
import PageHero from '../../../components/sections/PageHero'
import Reveal from '../../../components/ui/Reveal'
import { formatIDR } from '../../../data/format'
import { useAuth } from '../../../context/auth'
import { api } from '../../../lib/api'

const fmtDate = (iso) =>
  new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))

const STATUS_LABEL = {
  pending: 'Menunggu',
  awaiting_payment: 'Menunggu Pembayaran',
  paid: 'Berhasil',
  failed: 'Gagal',
  cancelled: 'Dibatalkan',
  expired: 'Kedaluwarsa',
}

function StatusBadge({ status }) {
  const ok = status === 'paid'
  const Icon = ok ? FiCheckCircle : status === 'awaiting_payment' || status === 'pending' ? FiClock : FiXCircle
  return (
    <span className={`pay-status ${ok ? 'pay-status--ok' : ''}`}>
      <Icon /> {STATUS_LABEL[status] || status}
    </span>
  )
}

export default function PaymentHistory() {
  const { user, ready } = useAuth()
  const [email, setEmail] = useState('')
  const [lookupEmail, setLookupEmail] = useState(null)
  const [orders, setOrders] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchOrders = (forEmail) => {
    setLoading(true)
    setError(null)
    api.orders
      .list(forEmail)
      .then(({ items }) => setOrders(items))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!ready) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetches the logged-in user's orders once auth state resolves
    if (user) fetchOrders(undefined)
  }, [ready, user])

  const onLookup = (e) => {
    e.preventDefault()
    setLookupEmail(email)
    fetchOrders(email)
  }

  const showEmailForm = ready && !user && lookupEmail === null

  return (
    <Page title="Riwayat Pembayaran — ECC-BTS">
      <PageHero
        title="Riwayat Pembayaran"
        crumb="Riwayat Pembayaran"
        subtitle="Pantau status dan riwayat transaksi pembayaran Anda."
      />

      <section className="section">
        <div className="container">
          {showEmailForm ? (
            <Reveal className="form-card" style={{ maxWidth: 480, margin: '0 auto' }}>
              <form onSubmit={onLookup} noValidate>
                <div className="field">
                  <label htmlFor="lookup-email">Masukkan email yang dipakai saat memesan</label>
                  <input
                    id="lookup-email"
                    type="email"
                    required
                    placeholder="email@contoh.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn--blue btn--block btn--lg">
                  Lihat Riwayat
                </button>
              </form>
            </Reveal>
          ) : loading || !ready ? (
            <p className="empty-note">Memuat riwayat pembayaran…</p>
          ) : error ? (
            <p className="empty-note">Gagal memuat riwayat: {error}</p>
          ) : !orders || orders.length === 0 ? (
            <Reveal className="cart-empty">
              <FiFileText className="cart-empty__ic" />
              <h2>Belum ada riwayat pembayaran</h2>
              <p>
                Setelah Anda menyelesaikan pembayaran, transaksinya akan tampil
                di sini.
              </p>
              <Link href="/produk" className="btn btn--blue btn--lg">
                Mulai Belanja <FiArrowRight />
              </Link>
            </Reveal>
          ) : (
            <div className="pay-history">
              {orders.map((o, i) => (
                <Reveal className="pay-record" key={o.id} delay={i * 0.05}>
                  <div className="pay-record__top">
                    <div>
                      <span className="pay-record__inv">Invoice #{o.order_no}</span>
                      <span className="pay-record__date">
                        <FiClock /> {fmtDate(o.created_at)} WIB
                      </span>
                    </div>
                    <StatusBadge status={o.status} />
                  </div>

                  <ul className="pay-record__items">
                    {o.items.map((it) => (
                      <li key={it.id}>
                        <span>
                          {it.title_snapshot}
                          {it.qty > 1 && <em> × {it.qty}</em>}
                        </span>
                        <b>{formatIDR(it.line_total)}</b>
                      </li>
                    ))}
                  </ul>

                  <div className="pay-record__foot">
                    <span className="pay-record__method">Order #{o.order_no}</span>
                    <span className="pay-record__total">
                      Total <b>{formatIDR(o.total)}</b>
                    </span>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </Page>
  )
}
