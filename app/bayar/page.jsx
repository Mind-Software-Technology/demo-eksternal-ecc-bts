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
  FiUpload,
} from 'react-icons/fi'
import { FaQrcode, FaUniversity, FaWallet, FaStore, FaMoneyBillWave } from 'react-icons/fa'
import Page from '../../components/layout/Page'
import BrandMark from '../../components/layout/BrandMark'
import { useCart } from '../../context/cart'
import { useAuth, loginUrl } from '../../context/auth'
import { useSiteConfig } from '../../hooks/useSiteConfig'
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

const BANKS = [
  { id: 'bca', label: 'BCA', logo: '/banks/bca.svg' },
  { id: 'bni', label: 'BNI', logo: '/banks/bni.svg' },
  { id: 'bri', label: 'BRI', logo: '/banks/bri.svg' },
  { id: 'permata', label: 'Permata', logo: '/banks/permata.svg' },
]
const EWALLETS = [
  { id: 'gopay', label: 'GoPay', logo: '/banks/gopay.svg' },
  { id: 'shopeepay', label: 'ShopeePay', logo: '/banks/shopeepay.svg' },
]
const STORES = [
  { id: 'indomaret', label: 'Indomaret', logo: '/banks/indomaret.svg' },
  { id: 'alfamart', label: 'Alfamart', logo: '/banks/alfamart.svg' },
]

function BrandBadge({ logo, label }) {
  return (
    <span className="pay-brand-badge">
      {/* eslint-disable-next-line @next/next/no-img-element -- static local SVG, no need for next/image sizing */}
      <img src={logo} alt={label} loading="lazy" decoding="async" />
    </span>
  )
}

const ALL_BRANDS = Object.fromEntries(
  [...BANKS, ...EWALLETS, ...STORES].map((b) => [b.id, b]),
)

const METHODS = [
  { id: 'qris', label: 'QRIS', desc: 'Scan via semua bank & e-wallet', icon: FaQrcode },
  { id: 'bank_transfer', label: 'Virtual Account / Transfer Bank', desc: 'BCA, BNI, BRI, Permata', icon: FaUniversity },
  { id: 'ewallet', label: 'E-Wallet', desc: 'GoPay, ShopeePay', icon: FaWallet },
  { id: 'cstore', label: 'Gerai Retail', desc: 'Alfamart, Indomaret', icon: FaStore },
]

const MANUAL_METHOD = {
  id: 'manual_transfer',
  label: 'Transfer Bank Manual',
  desc: 'Transfer ke rekening, lalu unggah bukti',
  icon: FaMoneyBillWave,
}

const MAX_PROOF_BYTES = 10 * 1024 * 1024

const TERMINAL_OK = ['settlement', 'capture']
const TERMINAL_FAIL = ['expire', 'cancel', 'deny', 'failure']

// Sama dengan POLL_MS di NotificationContext — halaman ini menunggu aksi
// admin (penetapan harga) dan webhook Midtrans (status bayar), dua hal yang
// pelanggan tunggui sambil menatap layar.
const POLL_MS = 2000

function PaymentInner() {
  const searchParams = useSearchParams()
  const orderNo = searchParams.get('order_no')
  const { refresh: refreshCart } = useCart()
  const { user, ready: authReady } = useAuth()
  const router = useRouter()
  const siteConfig = useSiteConfig()

  // Default 'midtrans' — matches the backend's default so behavior stays
  // unchanged until an admin explicitly switches the mode.
  const paymentMode = siteConfig?.payment_method_mode || 'midtrans'
  const bankAccounts = siteConfig?.bank_accounts || []
  const methods = useMemo(() => {
    // Nothing to transfer into yet — don't offer a manual option that can't
    // actually be picked (admin turned the mode on but hasn't added a rekening).
    if (bankAccounts.length === 0) return METHODS
    if (paymentMode === 'manual') return [MANUAL_METHOD]
    if (paymentMode === 'both') return [...METHODS, MANUAL_METHOD]
    return METHODS
  }, [paymentMode, bankAccounts.length])

  const [openMethod, setOpenMethod] = useState('qris')
  const [bank, setBank] = useState('bca')
  const [store, setStore] = useState('indomaret')
  const [ewallet, setEwallet] = useState('gopay')
  const [bankAccountIndex, setBankAccountIndex] = useState(0)
  const [proofUploading, setProofUploading] = useState(false)
  const [proofError, setProofError] = useState(null)

  // Once site-config loads, make sure the open accordion item is actually one
  // of the methods currently offered (e.g. it defaulted to 'qris' but mode
  // turned out to be 'manual').
  useEffect(() => {
    if (!methods.find((m) => m.id === openMethod)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- swaps the open accordion item once site-config loads and the current one turns out unavailable for this mode
      setOpenMethod(methods[0]?.id ?? null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentMode])

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
  const [switching, setSwitching] = useState(false)
  const [switchError, setSwitchError] = useState(null)
  const [accepting, setAccepting] = useState(false)
  const [acceptError, setAcceptError] = useState(null)
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
      if (document.hidden) return
      api.payments
        .status(order.order_no)
        .then(setPayment)
        .catch(() => {})
    }, POLL_MS)
    return () => clearInterval(pollRef.current)
  }, [payment, order])

  // Poll the order itself while waiting on admin — picks up the moment a
  // price is set (awaiting_quote → quoted) without the customer needing to
  // reload the page.
  useEffect(() => {
    if (!order || order.status !== 'awaiting_quote') return
    const interval = setInterval(() => {
      if (document.hidden) return
      api.orders
        .show(order.order_no)
        .then(setOrder)
        .catch(() => {})
    }, POLL_MS)
    return () => clearInterval(interval)
  }, [order])

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
      } else if (openMethod === 'manual_transfer') {
        payload.payment_type = 'manual_transfer'
        payload.bank_account_index = bankAccountIndex
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
  const isPaid = order.status === 'paid' || (status && TERMINAL_OK.includes(status))
  const isFailed = ['cancelled', 'expired', 'failed'].includes(order.status) || (status && TERMINAL_FAIL.includes(status))
  const isCancelled = order.status === 'cancelled' || status === 'cancel'

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

  // Cancels the pending transaction and drops back to the method-selection
  // screen for this same order — for when the customer picked the wrong
  // payment method by mistake.
  const changeMethod = async () => {
    setSwitching(true)
    setSwitchError(null)
    try {
      await api.payments.changeMethod(order.order_no)
      setPayment(null)
    } catch (err) {
      setSwitchError(err.message || 'Gagal mengganti metode pembayaran.')
    } finally {
      setSwitching(false)
    }
  }

  // No separate "kirim" step — picking a file uploads it immediately.
  const selectProof = async (file) => {
    if (!file) return
    setProofError(null)
    if (file.size > MAX_PROOF_BYTES) {
      setProofError('Ukuran file maksimal 10MB.')
      return
    }
    setProofUploading(true)
    try {
      const updated = await api.payments.uploadProof(order.order_no, file)
      setPayment(updated)
    } catch (err) {
      setProofError(err.message || 'Gagal mengunggah bukti transfer. Coba lagi.')
    } finally {
      setProofUploading(false)
    }
  }

  const acceptQuote = async () => {
    setAccepting(true)
    setAcceptError(null)
    try {
      // Moves order.status to 'pending' — the component re-renders straight
      // into the payment method form below, no extra navigation needed.
      setOrder(await api.orders.acceptQuote(order.order_no))
    } catch (err) {
      setAcceptError(err.message || 'Gagal menyetujui penawaran.')
    } finally {
      setAccepting(false)
    }
  }

  // Admin hasn't priced this order yet — nothing to pay, so there's no
  // method-selection form to show. Reached right after the WhatsApp
  // consultation, before the admin has had a chance to input the price.
  if (order.status === 'awaiting_quote' && !payment) {
    return (
      <Page title="Menunggu Penawaran Harga — ECC-BTS">
        <div className="pay-done">
          <FiClock className="pay-done__ic" />
          <h1>Menunggu Penawaran Harga</h1>
          <p className="pay-record__note pay-record__note--processing" style={{ justifyContent: 'center' }}>
            Sedang diproses admin
          </p>
          <p>
            Admin kami sedang menyiapkan penawaran harga untuk invoice{' '}
            <b>#{order.order_no}</b> berdasarkan hasil konsultasi Anda. Halaman ini akan
            otomatis memperbarui diri dan menampilkan pilihan pembayaran begitu harga tersedia.
          </p>
          <div className="pay-done__actions">
            <Link href="/riwayat-pembayaran" className="btn btn--blue btn--lg">
              Lihat Riwayat Pembayaran
            </Link>
          </div>
        </div>
      </Page>
    )
  }

  // Priced, but not yet accepted — review the quote here before it unlocks
  // the payment method form.
  if (order.status === 'quoted' && !payment) {
    return (
      <Page title={`Penawaran Harga ${formatIDR(total)} — ECC-BTS`}>
        <div className="pay-page pay-page--single">
          <div className="pay-main">
            <header className="pay-head">
              <BrandMark />
              <span className="pay-locale">
                <FiGlobe /> Bahasa Indonesia
              </span>
            </header>

            <div className="pay-amount">
              <span className="pay-amount__due">
                <FiFileText /> Penawaran harga — invoice #{order.order_no}
              </span>
              <strong className="pay-amount__value">{formatIDR(total)}</strong>
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

            {acceptError && <p className="auth-modal__error">{acceptError}</p>}
            <button
              type="button"
              className="btn btn--primary btn--block btn--lg pay-confirm"
              onClick={acceptQuote}
              disabled={accepting}
            >
              {accepting ? 'Memproses…' : 'Setuju & Lanjut Bayar'}
            </button>

            <Link href="/riwayat-pembayaran" className="pay-back">
              <FiArrowLeft /> Lihat riwayat pembayaran
            </Link>
          </div>
        </div>
      </Page>
    )
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

            {payment.payment_type === 'manual_transfer' ? (
              <div className="pay-method__body">
                {!payment.has_proof ? (
                  <>
                    <div className="pay-static">
                      <p>
                        Transfer sejumlah <b>{formatIDR(total)}</b> ke rekening berikut,
                        lalu unggah bukti transfernya di bawah:
                      </p>
                      <div className="pay-va">
                        <span className="pay-va__label">
                          {payment.bank_account?.bank_name || 'Bank'}
                        </span>
                        <span className="pay-va__value">
                          <b>{payment.bank_account?.account_number || '—'}</b>
                          <button
                            type="button"
                            className="pay-copy-btn"
                            aria-label="Salin nomor rekening"
                            onClick={() => copyToClipboard(payment.bank_account?.account_number || '', 'rek')}
                          >
                            {copiedField === 'rek' ? <FiCheck /> : <FiCopy />}
                            {copiedField === 'rek' ? 'Tersalin' : 'Salin'}
                          </button>
                        </span>
                      </div>
                      {payment.bank_account?.account_holder && (
                        <p className="pay-qr__hint">a.n. {payment.bank_account.account_holder}</p>
                      )}
                    </div>

                    <div className="field">
                      <label htmlFor="proof-file">Unggah Bukti Transfer</label>
                      <input
                        id="proof-file"
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        disabled={proofUploading}
                        onChange={(e) => selectProof(e.target.files?.[0] || null)}
                      />
                      {proofUploading && (
                        <p className="pay-qr__hint">
                          <FiUpload /> Mengunggah bukti transfer…
                        </p>
                      )}
                      {proofError && <p className="auth-modal__error">{proofError}</p>}
                    </div>
                  </>
                ) : (
                  <p className="pay-qr__hint">
                    <FiClock /> Bukti transfer terkirim. Menunggu verifikasi admin — halaman
                    ini akan otomatis diperbarui begitu diverifikasi.
                  </p>
                )}
              </div>
            ) : (
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
                  <span className="pay-va__label">
                    {ALL_BRANDS[payment.channel_detail] && (
                      <BrandBadge {...ALL_BRANDS[payment.channel_detail]} />
                    )}
                    No. Virtual Account ({payment.channel_detail || payment.payment_type})
                  </span>
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
                  <span className="pay-va__label">
                    {ALL_BRANDS[payment.channel_detail] && (
                      <BrandBadge {...ALL_BRANDS[payment.channel_detail]} />
                    )}
                    Kode Pembayaran
                  </span>
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
            )}

            {switchError && <p className="auth-modal__error">{switchError}</p>}
            <button
              type="button"
              className="btn btn--outline btn--block"
              onClick={changeMethod}
              disabled={switching || cancelling}
            >
              {switching ? 'Mengganti…' : 'Ganti Metode Pembayaran'}
            </button>

            {cancelError && <p className="auth-modal__error">{cancelError}</p>}
            <button
              type="button"
              className="btn btn--outline btn--block"
              onClick={cancelOrder}
              disabled={cancelling || switching}
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

          <div className="pay-amount">
            <span className="pay-amount__due">
              <FiClock /> Bayar sebelum {dueLabel} WIB
            </span>
            <strong className="pay-amount__value">{formatIDR(total)}</strong>
          </div>

          {error && <p className="auth-modal__error">{error}</p>}

          <h2 className="pay-section-label">Metode Pembayaran</h2>

          <div className="pay-methods">
            {methods.map((m) => {
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
                                key={b.id}
                                className={`pay-chip ${bank === b.id ? 'is-selected' : ''}`}
                                aria-pressed={bank === b.id}
                                onClick={() => setBank(b.id)}
                              >
                                <BrandBadge logo={b.logo} label={b.label} />
                                {b.label}
                                {bank === b.id && <FiCheck className="pay-chip__check" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {m.id === 'ewallet' && (
                        <div className="pay-static">
                          <p>Pilih e-wallet:</p>
                          <div className="pay-chips">
                            {EWALLETS.map((w) => (
                              <button
                                type="button"
                                key={w.id}
                                className={`pay-chip ${ewallet === w.id ? 'is-selected' : ''}`}
                                aria-pressed={ewallet === w.id}
                                onClick={() => setEwallet(w.id)}
                              >
                                <BrandBadge logo={w.logo} label={w.label} />
                                {w.label}
                                {ewallet === w.id && <FiCheck className="pay-chip__check" />}
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
                                key={s.id}
                                className={`pay-chip ${store === s.id ? 'is-selected' : ''}`}
                                aria-pressed={store === s.id}
                                onClick={() => setStore(s.id)}
                              >
                                <BrandBadge logo={s.logo} label={s.label} />
                                {s.label}
                                {store === s.id && <FiCheck className="pay-chip__check" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {m.id === 'manual_transfer' && (
                        <div className="pay-static">
                          <p>Pilih rekening tujuan transfer:</p>
                          <div className="pay-chips pay-chips--stacked">
                            {bankAccounts.map((acc, idx) => (
                              <div
                                key={idx}
                                className={`pay-chip pay-chip--bank ${bankAccountIndex === idx ? 'is-selected' : ''}`}
                              >
                                <button
                                  type="button"
                                  className="pay-chip__select"
                                  aria-pressed={bankAccountIndex === idx}
                                  onClick={() => setBankAccountIndex(idx)}
                                >
                                  <span>
                                    <b>{acc.bank_name}</b> — {acc.account_number}
                                    <br />
                                    <small>a.n. {acc.account_holder}</small>
                                  </span>
                                  {bankAccountIndex === idx && (
                                    <FiCheck className="pay-chip__check pay-chip__check--inline" />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  className="pay-copy-btn"
                                  aria-label={`Salin nomor rekening ${acc.bank_name}`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    copyToClipboard(acc.account_number, `bank-${idx}`)
                                  }}
                                >
                                  {copiedField === `bank-${idx}` ? <FiCheck /> : <FiCopy />}
                                  {copiedField === `bank-${idx}` ? 'Tersalin' : 'Salin'}
                                </button>
                              </div>
                            ))}
                          </div>
                          <p className="pay-qr__hint">
                            Setelah menekan tombol bayar, Anda bisa langsung mengunggah bukti
                            transfer ke rekening yang dipilih.
                          </p>
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
