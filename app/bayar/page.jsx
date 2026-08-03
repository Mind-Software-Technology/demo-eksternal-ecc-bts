'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
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
  FiCopy,
  FiCheck,
  FiDownload,
} from 'react-icons/fi'
import { FaQrcode, FaUniversity, FaWallet, FaStore } from 'react-icons/fa'
import Page from '../../components/layout/Page'
import BrandMark from '../../components/layout/BrandMark'
import CheckoutSteps from '../../components/layout/CheckoutSteps'
import { useCart } from '../../context/cart'
import { useAuth, loginUrl } from '../../context/auth'
import { formatIDR } from '../../data/format'
import { api } from '../../lib/api'
import { takeCachedOrder } from '../../lib/checkoutOrderCache'

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

function PaymentInner() {
  const searchParams = useSearchParams()
  const orderNo = searchParams.get('order_no')
  const { refresh: refreshCart } = useCart()
  const { user, ready: authReady } = useAuth()
  const router = useRouter()

  const [openMethod, setOpenMethod] = useState('qris')
  const [bank, setBank] = useState('bca')
  const [store, setStore] = useState('indomaret')
  const [ewallet, setEwallet] = useState('gopay')

  // Step 1 (/bayar/data) hands the just-created order off via an in-memory
  // cache so this page can render immediately instead of re-fetching it over
  // the network and flashing blank while the request is in flight.
  const [order, setOrder] = useState(() => (orderNo ? takeCachedOrder(orderNo) : null))
  const [orderLoading, setOrderLoading] = useState(() => !order)
  const [orderError, setOrderError] = useState(null)
  const [payment, setPayment] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState(null)
  const [copiedField, setCopiedField] = useState(null)
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

  // Checkout is account-only — bounce a logged-out visitor to login.
  useEffect(() => {
    if (authReady && !user) {
      router.replace(loginUrl(orderNo ? `/bayar?order_no=${orderNo}` : '/bayar'))
    }
  }, [authReady, user, router, orderNo])

  // This step only makes sense once an order exists — step 1 (/bayar/data)
  // is the one that creates it.
  useEffect(() => {
    if (!orderNo) router.replace('/bayar/data')
  }, [orderNo, router])

  // Load the order created in step 1 — skipped when it was already handed off
  // via the cache above (the normal step 1 → step 2 flow).
  useEffect(() => {
    if (!user || !orderNo || order?.order_no === orderNo) return
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect -- re-shows the loading state for a direct visit / orderNo change, not covered by the cache above
    setOrderLoading(true)
    api.orders
      .show(orderNo)
      .then((data) => {
        if (cancelled) return
        setOrder(data)
        setOrderError(null)
      })
      .catch((err) => {
        if (!cancelled) setOrderError(err.message || 'Pesanan tidak ditemukan.')
      })
      .finally(() => {
        if (!cancelled) setOrderLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user, orderNo, order])

  // The cart was already cleared server-side when the order was created in
  // step 1 — sync the local cart state (navbar badge etc.) now that we're here.
  useEffect(() => {
    if (order) refreshCart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id])

  // Poll payment status once a charge has been made.
  useEffect(() => {
    if (!payment || TERMINAL_OK.includes(payment.transaction_status) || TERMINAL_FAIL.includes(payment.transaction_status)) {
      return
    }
    pollRef.current = setInterval(() => {
      api.payments
        .status(order.order_no)
        .then(setPayment)
        .catch(() => {})
    }, 4000)
    return () => clearInterval(pollRef.current)
  }, [payment, order])

  if (!authReady || !user || !orderNo || orderLoading) return null

  if (orderError) {
    return (
      <Page title="Pesanan Tidak Ditemukan — ECC-BTS">
        <div className="pay-done">
          <FiXCircle className="pay-done__ic" style={{ color: 'var(--color-danger)' }} />
          <h1>Pesanan Tidak Ditemukan</h1>
          <p>{orderError}</p>
          <div className="pay-done__actions">
            <Link href="/keranjang" className="btn btn--primary btn--lg">
              Kembali ke Keranjang
            </Link>
          </div>
        </div>
      </Page>
    )
  }

  if (!order) return null

  const total = order.total
  const items = order.items || []
  const description =
    items.length === 0
      ? 'Pembayaran layanan ECC-BTS'
      : items.length === 1
        ? `Pembayaran untuk ${items[0].title_snapshot}`
        : `Pembayaran untuk ${items.length} layanan (${items[0].title_snapshot}, dll.)`

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const payload = { order_no: order.order_no }
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

      const paymentData = await api.payments.charge(payload)
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
  const isCancelled = status === 'cancel'

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — fall back to the
      // classic hidden-textarea + execCommand trick.
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      try {
        document.execCommand('copy')
      } catch {
        // Copy genuinely unsupported — the number stays visible for a manual copy.
      }
      ta.remove()
    }
    setCopiedField(field)
    setTimeout(() => setCopiedField((f) => (f === field ? null : f)), 1500)
  }

  const downloadQr = async (url, orderNoForFile) => {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error('download failed')
      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = `qris-${orderNoForFile}.png`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(objectUrl)
    } catch {
      // Cross-origin image without CORS headers — open it directly so the
      // user can still save it manually (long-press / right-click).
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const cancelOrder = async () => {
    setCancelling(true)
    setCancelError(null)
    try {
      setPayment(await api.payments.cancel(order.order_no))
    } catch (err) {
      setCancelError(err.message || 'Gagal membatalkan pesanan.')
    } finally {
      setCancelling(false)
    }
  }

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
      <Page title={isCancelled ? 'Pesanan Dibatalkan — ECC-BTS' : 'Pembayaran Gagal — ECC-BTS'}>
        <div className="pay-done">
          <FiXCircle className="pay-done__ic" style={{ color: 'var(--color-danger)' }} />
          <h1>{isCancelled ? 'Pesanan Dibatalkan' : 'Pembayaran Tidak Berhasil'}</h1>
          <p>
            {isCancelled ? (
              <>Pesanan untuk invoice <b>#{order.order_no}</b> telah Anda batalkan.</>
            ) : (
              <>
                Transaksi untuk invoice <b>#{order.order_no}</b> berstatus{' '}
                <b>{status}</b>. Silakan coba lagi dengan metode pembayaran lain.
              </>
            )}
          </p>
          <div className="pay-done__actions">
            <Link href="/keranjang" className="btn btn--primary btn--lg">
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
                  <button
                    type="button"
                    className="btn btn--outline btn--sm"
                    onClick={() => downloadQr(payment.qr_url, order.order_no)}
                  >
                    <FiDownload /> Unduh QR
                  </button>
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
                  <span className="pay-va__value">
                    <b>{payment.va_number}</b>
                    <button
                      type="button"
                      className="pay-copy-btn"
                      aria-label="Salin nomor virtual account"
                      onClick={() => copyToClipboard(payment.va_number, 'va')}
                    >
                      {copiedField === 'va' ? <FiCheck /> : <FiCopy />}
                      {copiedField === 'va' ? 'Tersalin' : 'Salin'}
                    </button>
                  </span>
                </div>
              )}
              {payment.payment_code && (
                <div className="pay-va">
                  <span>Kode Pembayaran</span>
                  <span className="pay-va__value">
                    <b>{payment.payment_code}</b>
                    <button
                      type="button"
                      className="pay-copy-btn"
                      aria-label="Salin kode pembayaran"
                      onClick={() => copyToClipboard(payment.payment_code, 'code')}
                    >
                      {copiedField === 'code' ? <FiCheck /> : <FiCopy />}
                      {copiedField === 'code' ? 'Tersalin' : 'Salin'}
                    </button>
                  </span>
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

            {cancelError && <p className="auth-modal__error">{cancelError}</p>}
            <button
              type="button"
              className="btn btn--outline btn--block"
              onClick={cancelOrder}
              disabled={cancelling}
            >
              {cancelling ? 'Membatalkan…' : 'Batalkan Pesanan'}
            </button>

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

          <CheckoutSteps active={2} />

          <div className="pay-amount">
            <span className="pay-amount__due">
              <FiClock /> Bayar sebelum {dueLabel} WIB
            </span>
            <strong className="pay-amount__value">{formatIDR(total)}</strong>
          </div>

          {error && <p className="auth-modal__error">{error}</p>}

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

          <Link href={`/bayar/data?order_no=${encodeURIComponent(order.order_no)}`} className="pay-back">
            <FiArrowLeft /> Ubah data pemesan
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
            {items.map((it) => (
              <li key={it.id}>
                <span>
                  {it.title_snapshot}
                  {it.qty > 1 && <em> × {it.qty}</em>}
                </span>
                <b>{formatIDR(it.line_total)}</b>
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

export default function Payment() {
  return (
    <Suspense fallback={null}>
      <PaymentInner />
    </Suspense>
  )
}
