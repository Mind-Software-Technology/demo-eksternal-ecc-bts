'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiArrowRight,
  FiFileText,
  FiDownload,
  FiUploadCloud,
  FiStar,
} from 'react-icons/fi'
import Page from '../../../components/layout/Page'
import PageHero from '../../../components/sections/PageHero'
import Reveal from '../../../components/ui/Reveal'
import { formatIDR } from '../../../data/format'
import { useAuth, loginUrl } from '../../../context/auth'
import { api } from '../../../lib/api'
import { setCachedOrder } from '../../../lib/checkoutOrderCache'

const fmtDate = (iso) =>
  new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))

const STATUS_LABEL = {
  awaiting_quote: 'Menunggu Penawaran Harga',
  quoted: 'Menunggu Persetujuan',
  pending: 'Menunggu',
  awaiting_payment: 'Menunggu Pembayaran',
  paid: 'Berhasil',
  failed: 'Gagal',
  cancelled: 'Dibatalkan',
  expired: 'Kedaluwarsa',
}

const CLOCK_STATUSES = ['awaiting_payment', 'pending', 'awaiting_quote', 'quoted']

function StatusBadge({ status }) {
  const ok = status === 'paid'
  const Icon = ok ? FiCheckCircle : CLOCK_STATUSES.includes(status) ? FiClock : FiXCircle
  return (
    <span className={`pay-status ${ok ? 'pay-status--ok' : ''}`}>
      <Icon /> {STATUS_LABEL[status] || status}
    </span>
  )
}

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0)
  const shown = hover || value
  return (
    <div className="star-picker" role="radiogroup" aria-label="Rating bintang">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} bintang`}
          className={`star-picker__star ${n <= shown ? 'is-on' : ''}`}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
        >
          <FiStar />
        </button>
      ))}
    </div>
  )
}

function TestimonialForm({ order, onSubmitted }) {
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState('')
  const [text, setText] = useState('')
  const [rating, setRating] = useState(5)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await api.orders.submitTestimonial(order.order_no, { role, text, rating })
      onSubmitted()
    } catch (err) {
      setError(err.message || 'Gagal mengirim testimoni.')
    } finally {
      setBusy(false)
    }
  }

  if (!open) {
    return (
      <button type="button" className="btn btn--outline btn--sm pay-record__review-btn" onClick={() => setOpen(true)}>
        Beri Testimoni
      </button>
    )
  }

  return (
    <form onSubmit={submit} className="testimonial-form">
      <p className="testimonial-form__title">Bagaimana pengalaman Anda?</p>

      <StarPicker value={rating} onChange={setRating} />

      <label className="testimonial-form__field">
        <span>Peran Anda</span>
        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="mis. Mahasiswa S1"
          required
        />
      </label>

      <label className="testimonial-form__field">
        <span>Testimoni</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ceritakan pengalaman Anda menggunakan layanan ini…"
          rows={3}
          required
        />
      </label>

      {error && <p className="testimonial-form__error">{error}</p>}
      <button type="submit" className="btn btn--primary btn--sm" disabled={busy}>
        {busy ? 'Mengirim…' : 'Kirim Testimoni'}
      </button>
    </form>
  )
}

export default function PaymentHistory() {
  const { user, ready } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [cancellingNo, setCancellingNo] = useState(null)
  const [cancelError, setCancelError] = useState(null)
  const [acceptingNo, setAcceptingNo] = useState(null)
  const [decliningNo, setDecliningNo] = useState(null)
  const [quoteError, setQuoteError] = useState(null)

  // Orders are account-only — bounce a logged-out visitor to login.
  useEffect(() => {
    if (ready && !user) router.replace(loginUrl('/riwayat-pembayaran'))
  }, [ready, user, router])

  useEffect(() => {
    if (!user) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetches the logged-in user's order history once auth resolves
    setLoading(true)
    setError(null)
    api.orders
      .list()
      .then(({ items }) => setOrders(items))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [user])

  const cancelOrder = async (orderNo) => {
    setCancellingNo(orderNo)
    setCancelError(null)
    try {
      await api.payments.cancel(orderNo)
    } catch (e) {
      setCancelError(e.message || 'Gagal membatalkan pesanan.')
    } finally {
      // Refresh regardless of outcome — a failed cancel can still have synced
      // the order to its real (e.g. already-expired) status behind the scenes.
      try {
        const { items } = await api.orders.list()
        setOrders(items)
      } catch { /* keep showing the previous list if this refetch also fails */ }
      setCancellingNo(null)
    }
  }

  const acceptQuote = async (order) => {
    setAcceptingNo(order.order_no)
    setQuoteError(null)
    try {
      const updated = await api.orders.acceptQuote(order.order_no)
      setCachedOrder(updated)
      router.push(`/bayar?order_no=${encodeURIComponent(order.order_no)}`)
    } catch (e) {
      setQuoteError(e.message || 'Gagal menyetujui penawaran.')
      setAcceptingNo(null)
    }
  }

  const declineQuote = async (orderNo) => {
    setDecliningNo(orderNo)
    setQuoteError(null)
    try {
      await api.orders.declineQuote(orderNo)
    } catch (e) {
      setQuoteError(e.message || 'Gagal membatalkan permintaan.')
    } finally {
      try {
        const { items } = await api.orders.list()
        setOrders(items)
      } catch { /* keep showing the previous list if this refetch also fails */ }
      setDecliningNo(null)
    }
  }

  if (!ready || !user) return null

  return (
    <Page title="Riwayat Pembayaran — ECC-BTS">
      <PageHero
        title="Riwayat Pembayaran"
        crumb="Riwayat Pembayaran"
        subtitle="Pantau status dan riwayat transaksi pembayaran Anda."
      />

      <section className="section">
        <div className="container">
          {loading ? (
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
              <Link href="/produk" className="btn btn--primary btn--lg">
                Mulai Belanja <FiArrowRight />
              </Link>
            </Reveal>
          ) : (
            <div className="pay-history">
              {cancelError && <p className="auth-modal__error">{cancelError}</p>}
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
                    {(o.items || []).map((it) => (
                      <li key={it.id}>
                        <span>
                          {it.title_snapshot}
                          {it.qty > 1 && <em> × {it.qty}</em>}
                        </span>
                        <span className="pay-record__item-right">
                          {it.has_result && (
                            <a
                              className="pay-record__result"
                              href={api.orders.resultUrl(o.order_no, it.id)}
                              target="_blank"
                              rel="noopener"
                              title={it.result_original_name}
                            >
                              <FiDownload /> Hasil Siap — Unduh
                            </a>
                          )}
                          {it.has_attachment && (
                            <a
                              className="pay-record__attachment"
                              href={api.orders.attachmentUrl(o.order_no, it.id)}
                              target="_blank"
                              rel="noopener"
                              title={it.attachment_original_name}
                            >
                              <FiUploadCloud /> File Saya
                            </a>
                          )}
                          <b>{it.line_total != null ? formatIDR(it.line_total) : '—'}</b>
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="pay-record__foot">
                    <span className="pay-record__method">Order #{o.order_no}</span>
                    <span className="pay-record__total">
                      Total <b>{o.total != null ? formatIDR(o.total) : 'Menunggu penawaran'}</b>
                    </span>
                  </div>

                  {quoteError && <p className="auth-modal__error">{quoteError}</p>}

                  {o.status === 'awaiting_quote' && (
                    <div className="pay-record__quote-actions">
                      <p className="pay-record__note">
                        Menunggu penawaran harga dari admin. Kami akan memberi tahu Anda setelah harga ditentukan.
                      </p>
                      <button
                        type="button"
                        className="btn btn--outline btn--sm"
                        onClick={() => declineQuote(o.order_no)}
                        disabled={decliningNo === o.order_no}
                      >
                        {decliningNo === o.order_no ? 'Memproses…' : 'Batalkan Permintaan'}
                      </button>
                    </div>
                  )}

                  {o.status === 'quoted' && (
                    <div className="pay-record__quote-actions">
                      <button
                        type="button"
                        className="btn btn--primary btn--sm"
                        onClick={() => acceptQuote(o)}
                        disabled={acceptingNo === o.order_no}
                      >
                        {acceptingNo === o.order_no ? 'Memproses…' : 'Setuju & Bayar'}
                      </button>
                      <button
                        type="button"
                        className="btn btn--outline btn--sm"
                        onClick={() => declineQuote(o.order_no)}
                        disabled={decliningNo === o.order_no}
                      >
                        {decliningNo === o.order_no ? 'Memproses…' : 'Tolak Penawaran'}
                      </button>
                    </div>
                  )}

                  {o.status === 'pending' && (
                    <div className="pay-record__quote-actions">
                      <Link
                        href={`/bayar?order_no=${encodeURIComponent(o.order_no)}`}
                        className="btn btn--primary btn--sm"
                      >
                        Lanjutkan Pembayaran
                      </Link>
                    </div>
                  )}

                  {o.can_review && (
                    <TestimonialForm order={o} onSubmitted={() => api.orders.list().then(({ items }) => setOrders(items))} />
                  )}
                  {o.has_testimonial && <p className="pay-record__thanks">Terima kasih atas testimoni Anda.</p>}

                  {o.status === 'awaiting_payment' && (
                    <button
                      type="button"
                      className="btn btn--outline btn--sm pay-record__cancel"
                      onClick={() => cancelOrder(o.order_no)}
                      disabled={cancellingNo === o.order_no}
                    >
                      {cancellingNo === o.order_no ? 'Membatalkan…' : 'Batalkan Pesanan'}
                    </button>
                  )}
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </Page>
  )
}
