'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  FiGlobe,
  FiClock,
  FiFileText,
  FiShield,
  FiChevronDown,
  FiArrowLeft,
  FiLock,
  FiCheckCircle,
  FiXCircle,
} from 'react-icons/fi'
import { FaQrcode, FaUniversity, FaWallet, FaStore } from 'react-icons/fa'
import Page from '../../components/layout/Page'
import BrandMark from '../../components/layout/BrandMark'
import { useCart } from '../../context/cart'
import { useAuth } from '../../context/auth'
import { formatIDR } from '../../data/format'
import { api } from '../../lib/api'

/* Decorative fallback QR (used only if Midtrans doesn't return a qr_url — e.g.
   sandbox response variations). Not a real scannable code. */
function QrisFallback({ seed = 'ECC-BTS', size = 196 }) {
  const N = 25
  const unit = size / N
  const isFinderZone = (x, y) =>
    (x < 8 && y < 8) || (x >= N - 8 && y < 8) || (x < 8 && y >= N - 8)
  const finderModule = (x, y) => {
    const local = (lx, ly) => {
      if (lx < 0 || ly < 0 || lx > 6 || ly > 6) return false
      const border = lx === 0 || lx === 6 || ly === 0 || ly === 6
      const core = lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4
      return border || core
    }
    if (x < 7 && y < 7) return local(x, y)
    if (x >= N - 7 && y < 7) return local(x - (N - 7), y)
    if (x < 7 && y >= N - 7) return local(x, y - (N - 7))
    return false
  }
  const rects = []
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      let on
      if (isFinderZone(x, y)) {
        on = finderModule(x, y)
      } else {
        const h = Math.sin((x + 1) * 12.9898 + (y + 1) * 78.233 + seed.length * 3.77) * 43758.5453
        on = h - Math.floor(h) > 0.52
      }
      if (on) rects.push(<rect key={`${x}-${y}`} x={x * unit} y={y * unit} width={unit} height={unit} />)
    }
  }
  return (
    <svg className="pay-qr__svg" width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Kode QRIS" fill="#152149">
      <rect x="0" y="0" width={size} height={size} fill="#fff" />
      {rects}
    </svg>
  )
}

const BANKS = ['bca', 'bni', 'bri', 'permata']
const STORES = ['indomaret', 'alfamart']

const METHODS = [
  { id: 'qris', label: 'QRIS', desc: 'Scan via semua bank & e-wallet', icon: FaQrcode },
  { id: 'bank_transfer', label: 'Virtual Account / Transfer Bank', desc: 'BCA, BNI, BRI, Permata', icon: FaUniversity },
  { id: 'ewallet', label: 'E-Wallet', desc: 'GoPay, ShopeePay', icon: FaWallet },
  { id: 'cstore', label: 'Gerai Retail', desc: 'Alfamart, Indomaret', icon: FaStore },
]

const TERMINAL_OK = ['settlement', 'capture']
const TERMINAL_FAIL = ['expire', 'cancel', 'deny', 'failure']

export default function Payment() {
  const { detailed, total, ready, refresh: refreshCart } = useCart()
  const { user, ready: authReady } = useAuth()
  const router = useRouter()

  const [openMethod, setOpenMethod] = useState('qris')
  const [bank, setBank] = useState('bca')
  const [store, setStore] = useState('indomaret')
  const [ewallet, setEwallet] = useState('gopay')

  const [guest, setGuest] = useState({ guest_name: '', guest_email: '', guest_phone: '' })
  const [order, setOrder] = useState(null)
  const [payment, setPayment] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const pollRef = useRef(null)

  const [dueAt] = useState(() => new Date(Date.now() + 24 * 60 * 60 * 1000))
  const dueLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(dueAt),
    [dueAt],
  )

  const description = useMemo(() => {
    if (detailed.length === 0) return 'Pembayaran layanan ECC-BTS'
    if (detailed.length === 1) return `Pembayaran untuk ${detailed[0].title}`
    return `Pembayaran untuk ${detailed.length} layanan (${detailed[0].title}, dll.)`
  }, [detailed])

  // Reached with an empty cart (e.g. direct URL / refresh) and no order created yet.
  useEffect(() => {
    if (ready && detailed.length === 0 && !order) router.replace('/keranjang')
  }, [ready, detailed.length, order, router])

  // Poll payment status once a charge has been made.
  useEffect(() => {
    if (!payment || TERMINAL_OK.includes(payment.transaction_status) || TERMINAL_FAIL.includes(payment.transaction_status)) {
      return
    }
    pollRef.current = setInterval(() => {
      api.payments
        .status(order.order_no, order.guest_email)
        .then(setPayment)
        .catch(() => {})
    }, 4000)
    return () => clearInterval(pollRef.current)
  }, [payment, order])

  // Cart is emptied server-side once the order is created — refresh the local view.
  useEffect(() => {
    if (order) refreshCart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order])

  if (!ready || !authReady || (detailed.length === 0 && !order)) return null

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      let currentOrder = order
      if (!currentOrder) {
        currentOrder = await api.orders.create(
          user
            ? {}
            : {
                guest_name: guest.guest_name,
                guest_email: guest.guest_email,
                guest_phone: guest.guest_phone || undefined,
              },
        )
        setOrder(currentOrder)
      }

      const payload = { order_no: currentOrder.order_no }
      if (openMethod === 'bank_transfer') {
        payload.payment_type = 'bank_transfer'
        payload.bank = bank
      } else if (openMethod === 'ewallet') {
        payload.payment_type = ewallet
      } else if (openMethod === 'cstore') {
        payload.payment_type = 'cstore'
        payload.store = store
      } else {
        payload.payment_type = 'qris'
      }

      const paymentData = await api.payments.charge(payload, currentOrder.guest_email)
      setPayment(paymentData)
    } catch (err) {
      setError(err.message || 'Gagal memproses pembayaran. Coba lagi.')
    } finally {
      setBusy(false)
    }
  }

  const status = payment?.transaction_status
  const isPaid = status && TERMINAL_OK.includes(status)
  const isFailed = status && TERMINAL_FAIL.includes(status)

  if (isPaid) {
    return (
      <Page title="Pembayaran Berhasil — ECC-BTS">
        <div className="pay-done">
          <FiCheckCircle className="pay-done__ic" />
          <h1>Pembayaran Berhasil</h1>
          <p>
            Terima kasih! Pembayaran Anda untuk invoice <b>#{order.order_no}</b> telah
            kami terima. Tim ECC-BTS akan segera menghubungi Anda.
          </p>
          <div className="pay-done__actions">
            <Link href="/riwayat-pembayaran" className="btn btn--blue btn--lg">
              Lihat Riwayat Pembayaran
            </Link>
            <Link href="/produk" className="btn btn--outline btn--lg">
              Lihat Layanan Lain
            </Link>
          </div>
        </div>
      </Page>
    )
  }

  if (isFailed) {
    return (
      <Page title="Pembayaran Gagal — ECC-BTS">
        <div className="pay-done">
          <FiXCircle className="pay-done__ic" style={{ color: 'var(--color-danger)' }} />
          <h1>Pembayaran Tidak Berhasil</h1>
          <p>
            Transaksi untuk invoice <b>#{order.order_no}</b> berstatus{' '}
            <b>{status}</b>. Silakan coba lagi dengan metode pembayaran lain.
          </p>
          <div className="pay-done__actions">
            <Link href="/keranjang" className="btn btn--blue btn--lg">
              Kembali ke Keranjang
            </Link>
          </div>
        </div>
      </Page>
    )
  }

  // Payment charged, waiting for settlement — show instructions + poll status.
  if (payment) {
    return (
      <Page title={`Menunggu Pembayaran ${formatIDR(total)} — ECC-BTS`}>
        <div className="pay-page">
          <div className="pay-main">
            <header className="pay-head">
              <BrandMark />
              <span className="pay-locale">
                <FiGlobe /> Bahasa Indonesia
              </span>
            </header>

            <div className="pay-amount">
              <span className="pay-amount__due">
                <FiClock /> Menunggu pembayaran — invoice #{order.order_no}
              </span>
              <strong className="pay-amount__value">{formatIDR(total)}</strong>
            </div>

            <div className="pay-method__body">
              {payment.qr_url && (
                <div className="pay-qr">
                  <span className="pay-qr__brand">{payment.payment_type?.toUpperCase()}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={payment.qr_url} alt="Kode QR pembayaran" width={196} height={196} />
                </div>
              )}
              {!payment.qr_url && payment.payment_type === 'qris' && (
                <div className="pay-qr">
                  <span className="pay-qr__brand">QRIS</span>
                  <QrisFallback seed={order.order_no} />
                </div>
              )}
              {payment.va_number && (
                <div className="pay-va">
                  <span>No. Virtual Account ({payment.channel_detail || payment.payment_type})</span>
                  <b>{payment.va_number}</b>
                </div>
              )}
              {payment.payment_code && (
                <div className="pay-va">
                  <span>Kode Pembayaran</span>
                  <b>{payment.payment_code}</b>
                </div>
              )}
              {payment.deeplink_url && (
                <a href={payment.deeplink_url} target="_blank" rel="noopener noreferrer" className="btn btn--primary btn--block">
                  Buka Aplikasi Pembayaran
                </a>
              )}
              <p className="pay-qr__hint" style={{ marginTop: '1rem' }}>
                Status saat ini: <b>{status || 'menunggu pembayaran'}</b>. Halaman ini
                akan diperbarui otomatis begitu pembayaran diterima.
              </p>
            </div>

            <Link href="/riwayat-pembayaran" className="pay-back">
              <FiArrowLeft /> Lihat riwayat pembayaran
            </Link>
          </div>

          <aside className="pay-summary">
            <h3>Ringkasan Pesanan</h3>
            <dl className="pay-summary__meta">
              <dt>Invoice #</dt>
              <dd>{order.order_no}</dd>
            </dl>
            <div className="pay-summary__total">
              <span>Total Tagihan</span>
              <strong>{formatIDR(total)}</strong>
            </div>
          </aside>
        </div>
      </Page>
    )
  }

  return (
    <Page title={`Pembayaran ${formatIDR(total)} — ECC-BTS`}>
      <form className="pay-page" onSubmit={submit}>
        {/* ---------------------------------------------------- main column */}
        <div className="pay-main">
          <header className="pay-head">
            <BrandMark />
            <span className="pay-locale">
              <FiGlobe /> Bahasa Indonesia
            </span>
          </header>

          <div className="pay-amount">
            <span className="pay-amount__due">
              <FiClock /> Bayar sebelum {dueLabel} WIB
            </span>
            <strong className="pay-amount__value">{formatIDR(total)}</strong>
          </div>

          {error && <p className="auth-modal__error">{error}</p>}

          {!user && (
            <>
              <h2 className="pay-section-label">Data Pemesan</h2>
              <div className="field">
                <label htmlFor="guest_name">Nama Lengkap</label>
                <input
                  id="guest_name"
                  required
                  value={guest.guest_name}
                  onChange={(e) => setGuest({ ...guest, guest_name: e.target.value })}
                  placeholder="Nama Anda"
                />
              </div>
              <div className="field--row">
                <div className="field">
                  <label htmlFor="guest_email">Email</label>
                  <input
                    id="guest_email"
                    type="email"
                    required
                    value={guest.guest_email}
                    onChange={(e) => setGuest({ ...guest, guest_email: e.target.value })}
                    placeholder="email@contoh.com"
                  />
                </div>
                <div className="field">
                  <label htmlFor="guest_phone">No. HP (opsional)</label>
                  <input
                    id="guest_phone"
                    type="tel"
                    value={guest.guest_phone}
                    onChange={(e) => setGuest({ ...guest, guest_phone: e.target.value })}
                    placeholder="08xx-xxxx-xxxx"
                  />
                </div>
              </div>
            </>
          )}

          <h2 className="pay-section-label">Metode Pembayaran</h2>

          <div className="pay-methods">
            {METHODS.map((m) => {
              const Icon = m.icon
              const isOpen = openMethod === m.id
              return (
                <div className={`pay-method ${isOpen ? 'is-open' : ''}`} key={m.id}>
                  <button
                    type="button"
                    className="pay-method__head"
                    aria-expanded={isOpen}
                    onClick={() => setOpenMethod(isOpen ? null : m.id)}
                  >
                    <span className="pay-method__icon">
                      <Icon />
                    </span>
                    <span className="pay-method__text">
                      <b>{m.label}</b>
                      <small>{m.desc}</small>
                    </span>
                    <FiChevronDown className="pay-method__chevron" />
                  </button>

                  {isOpen && (
                    <div className="pay-method__body">
                      {m.id === 'qris' && (
                        <>
                          <div className="pay-fraud">
                            <FiShield />
                            <div>
                              <b>Lindungi Diri dari Penipuan</b>
                              <p>
                                Pastikan nama merchant, jumlah, dan detail
                                pembayaran sudah benar sebelum melanjutkan.
                              </p>
                            </div>
                          </div>
                          <p className="pay-qr__hint">
                            Kode QR akan ditampilkan setelah Anda menekan tombol
                            bayar di bawah.
                          </p>
                        </>
                      )}

                      {m.id === 'bank_transfer' && (
                        <div className="pay-static">
                          <p>Pilih bank untuk Virtual Account:</p>
                          <div className="pay-chips">
                            {BANKS.map((b) => (
                              <button
                                type="button"
                                key={b}
                                className="pay-chip"
                                aria-pressed={bank === b}
                                style={bank === b ? { background: 'var(--blue-600)', color: '#fff' } : undefined}
                                onClick={() => setBank(b)}
                              >
                                {b.toUpperCase()}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {m.id === 'ewallet' && (
                        <div className="pay-static">
                          <p>Pilih e-wallet:</p>
                          <div className="pay-chips">
                            {[
                              { id: 'gopay', label: 'GoPay' },
                              { id: 'shopeepay', label: 'ShopeePay' },
                            ].map((w) => (
                              <button
                                type="button"
                                key={w.id}
                                className="pay-chip"
                                aria-pressed={ewallet === w.id}
                                style={ewallet === w.id ? { background: 'var(--blue-600)', color: '#fff' } : undefined}
                                onClick={() => setEwallet(w.id)}
                              >
                                {w.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {m.id === 'cstore' && (
                        <div className="pay-static">
                          <p>Pilih gerai retail:</p>
                          <div className="pay-chips">
                            {STORES.map((s) => (
                              <button
                                type="button"
                                key={s}
                                className="pay-chip"
                                aria-pressed={store === s}
                                style={store === s ? { background: 'var(--blue-600)', color: '#fff' } : undefined}
                                onClick={() => setStore(s)}
                              >
                                {s === 'indomaret' ? 'Indomaret' : 'Alfamart'}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <button type="submit" className="btn btn--primary btn--block btn--lg pay-confirm" disabled={busy}>
            {busy ? 'Memproses…' : 'Bayar Sekarang'}
          </button>

          <Link href="/keranjang" className="pay-back">
            <FiArrowLeft /> Kembali ke keranjang
          </Link>

          <div className="pay-foot">
            <FiLock /> Pembayaran Aman · Midtrans Sandbox
          </div>
        </div>

        {/* ------------------------------------------------- summary column */}
        <aside className="pay-summary">
          <h3>Ringkasan Pesanan</h3>

          <div className="pay-summary__block">
            <span className="pay-summary__head">
              <FiFileText /> Deskripsi
            </span>
            <p>{description}</p>
          </div>

          <div className="pay-summary__block">
            <span className="pay-summary__head">
              <FiClock /> Jatuh tempo
            </span>
            <p>{dueLabel} WIB</p>
          </div>

          <ul className="pay-summary__items">
            {detailed.map((it) => (
              <li key={it.cartItemId}>
                <span>
                  {it.title}
                  {it.qty > 1 && <em> × {it.qty}</em>}
                </span>
                <b>{formatIDR(it.lineTotal)}</b>
              </li>
            ))}
          </ul>

          <div className="pay-summary__total">
            <span>Total Tagihan</span>
            <strong>{formatIDR(total)}</strong>
          </div>
        </aside>
      </form>
    </Page>
  )
}
