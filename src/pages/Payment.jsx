import { useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import {
  FiGlobe,
  FiClock,
  FiFileText,
  FiShield,
  FiChevronDown,
  FiArrowLeft,
  FiLock,
  FiCheckCircle,
} from 'react-icons/fi'
import { FaQrcode, FaUniversity, FaWallet, FaRegCreditCard, FaStore } from 'react-icons/fa'
import Page from '../components/layout/Page'
import BrandMark from '../components/layout/BrandMark'
import { useCart } from '../context/cart'
import { addPayment } from '../data/payments'
import { formatIDR } from '../data/format'

/* A self-contained, deterministic "QRIS-style" code (purely decorative — this
   is a static demo, not a real payment QR). */
function QrisCode({ seed = 'ECC-BTS', size = 196 }) {
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
    if (x < 7 && y < 7) return local(x, y) // top-left
    if (x >= N - 7 && y < 7) return local(x - (N - 7), y) // top-right
    if (x < 7 && y >= N - 7) return local(x, y - (N - 7)) // bottom-left
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
    <svg
      className="pay-qr__svg"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="Kode QRIS (demo)"
      fill="#152149"
    >
      <rect x="0" y="0" width={size} height={size} fill="#fff" />
      {rects}
    </svg>
  )
}

const METHODS = [
  {
    id: 'qris',
    label: 'QRIS',
    desc: 'Scan via semua bank & e-wallet',
    icon: FaQrcode,
  },
  {
    id: 'va',
    label: 'Virtual Account / Transfer Bank',
    desc: 'BCA, BNI, BRI, Mandiri, Permata',
    icon: FaUniversity,
  },
  {
    id: 'ewallet',
    label: 'E-Wallet',
    desc: 'OVO, DANA, GoPay, ShopeePay',
    icon: FaWallet,
  },
  {
    id: 'card',
    label: 'Kartu Kredit / Debit',
    desc: 'Visa, Mastercard, JCB',
    icon: FaRegCreditCard,
  },
  {
    id: 'retail',
    label: 'Gerai Retail',
    desc: 'Alfamart, Indomaret',
    icon: FaStore,
  },
]

export default function Payment() {
  const { detailed, total, clear } = useCart()
  const [open, setOpen] = useState('qris')
  const [paid, setPaid] = useState(false)

  // Stable per-visit order metadata (generated once on mount).
  const [invoice] = useState(() =>
    Math.random().toString(36).slice(2, 10).toUpperCase(),
  )
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

  // Reached with an empty cart (e.g. direct URL / refresh after paying).
  if (detailed.length === 0 && !paid) return <Navigate to="/keranjang" replace />

  const confirmPaid = () => {
    // Record to history BEFORE clearing the cart.
    addPayment({
      invoice,
      total,
      description,
      method: METHODS.find((m) => m.id === open)?.label || 'QRIS',
      status: 'success',
      paidAt: new Date().toISOString(),
      items: detailed.map((it) => ({
        title: it.title,
        qty: it.qty,
        lineTotal: it.lineTotal,
      })),
    })
    setPaid(true)
    clear()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (paid) {
    return (
      <Page title="Pembayaran Berhasil — ECC-BTS">
        <div className="pay-done">
          <FiCheckCircle className="pay-done__ic" />
          <h1>Pembayaran Berhasil</h1>
          <p>
            Terima kasih! Pembayaran Anda untuk invoice <b>#{invoice}</b> telah
            kami terima (demo). Tim ECC-BTS akan segera menghubungi Anda.
          </p>
          <div className="pay-done__actions">
            <Link to="/riwayat-pembayaran" className="btn btn--blue btn--lg">
              Lihat Riwayat Pembayaran
            </Link>
            <Link to="/produk" className="btn btn--outline btn--lg">
              Lihat Layanan Lain
            </Link>
          </div>
        </div>
      </Page>
    )
  }

  return (
    <Page title={`Pembayaran ${formatIDR(total)} — ECC-BTS`}>
      <div className="pay-page">
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

          <h2 className="pay-section-label">Metode Pembayaran</h2>

          <div className="pay-methods">
            {METHODS.map((m) => {
              const Icon = m.icon
              const isOpen = open === m.id
              return (
                <div className={`pay-method ${isOpen ? 'is-open' : ''}`} key={m.id}>
                  <button
                    type="button"
                    className="pay-method__head"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : m.id)}
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
                            Kami menerima pembayaran QRIS dari semua bank &
                            e-wallet.
                          </p>
                          <div className="pay-qr">
                            <span className="pay-qr__brand">QRIS</span>
                            <QrisCode seed={invoice} />
                            <span className="pay-qr__nmid">
                              NMID: ID2025460500767
                            </span>
                          </div>
                        </>
                      )}

                      {m.id === 'va' && (
                        <div className="pay-static">
                          <p>Pilih bank, lalu salin nomor Virtual Account:</p>
                          <div className="pay-chips">
                            {['BCA', 'BNI', 'BRI', 'Mandiri', 'Permata'].map((b) => (
                              <span className="pay-chip" key={b}>
                                {b}
                              </span>
                            ))}
                          </div>
                          <div className="pay-va">
                            <span>No. Virtual Account</span>
                            <b>8808 0826 1234 5678</b>
                          </div>
                        </div>
                      )}

                      {m.id === 'ewallet' && (
                        <div className="pay-static">
                          <p>Bayar instan lewat aplikasi e-wallet favorit Anda:</p>
                          <div className="pay-chips">
                            {['OVO', 'DANA', 'GoPay', 'ShopeePay', 'LinkAja'].map(
                              (w) => (
                                <span className="pay-chip" key={w}>
                                  {w}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                      {m.id === 'card' && (
                        <div className="pay-static">
                          <p>Bayar dengan kartu kredit atau debit:</p>
                          <div className="pay-chips">
                            {['Visa', 'Mastercard', 'JCB'].map((c) => (
                              <span className="pay-chip" key={c}>
                                {c}
                              </span>
                            ))}
                          </div>
                          <div className="pay-va">
                            <span>Nomor Kartu (demo)</span>
                            <b>4111 1111 1111 1111</b>
                          </div>
                        </div>
                      )}

                      {m.id === 'retail' && (
                        <div className="pay-static">
                          <p>Bayar tunai di gerai retail terdekat:</p>
                          <div className="pay-chips">
                            {['Alfamart', 'Indomaret'].map((r) => (
                              <span className="pay-chip" key={r}>
                                {r}
                              </span>
                            ))}
                          </div>
                          <div className="pay-va">
                            <span>Kode Pembayaran</span>
                            <b>1234 5678 9012</b>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <button
            type="button"
            className="btn btn--blue btn--block btn--lg pay-confirm"
            onClick={confirmPaid}
          >
            Saya Sudah Membayar
          </button>

          <Link to="/keranjang" className="pay-back">
            <FiArrowLeft /> Kembali ke keranjang
          </Link>

          <div className="pay-foot">
            <FiLock /> Pembayaran Aman · Demo ECC-BTS
          </div>
        </div>

        {/* ------------------------------------------------- summary column */}
        <aside className="pay-summary">
          <h3>Ringkasan Pesanan</h3>
          <dl className="pay-summary__meta">
            <dt>Invoice #</dt>
            <dd>{invoice}</dd>
          </dl>

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
              <li key={it.id}>
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
      </div>
    </Page>
  )
}
