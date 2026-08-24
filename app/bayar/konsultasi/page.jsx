'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { FiGlobe, FiArrowRight, FiXCircle, FiCheckCircle } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa6'
import Page from '../../../components/layout/Page'
import BrandMark from '../../../components/layout/BrandMark'
import CheckoutSteps from '../../../components/layout/CheckoutSteps'
import { useAuth, loginUrl } from '../../../context/auth'
import { api } from '../../../lib/api'
import { waLink } from '../../../data/site'
import { takeCachedOrder } from '../../../lib/checkoutOrderCache'

const confirmedKey = (orderNo) => `ecc-bts-wa-confirmed-${orderNo}`

/**
 * Checkout step 3 — the final step before payment. Files are already
 * uploaded by now (step 2); this is where the customer actually talks to
 * admin about pricing. WhatsApp can't call back into the browser, so the
 * "lanjut" button stays disabled until they've clicked the WhatsApp button
 * at least once — makes the consultation a real gate, not a skippable label.
 */
function KonsultasiInner() {
  const searchParams = useSearchParams()
  const orderNo = searchParams.get('order_no')
  const { user, ready: authReady } = useAuth()
  const router = useRouter()

  const [order, setOrder] = useState(() => takeCachedOrder(orderNo))
  const [loading, setLoading] = useState(!order)
  const [error, setError] = useState(null)
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    if (!orderNo || !user || order) return
    let cancelled = false
    api.orders
      .show(orderNo)
      .then((data) => {
        if (!cancelled) setOrder(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Pesanan tidak ditemukan.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [orderNo, user, order])

  // Remembers the click across a refresh (WA opens in a new tab, so this
  // page stays mounted — but a reload shouldn't force clicking WA again).
  useEffect(() => {
    if (!orderNo) return
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reads a persisted click flag on mount, not derivable from render state
      if (localStorage.getItem(confirmedKey(orderNo)) === '1') setConfirmed(true)
    } catch {
      /* storage unavailable — gate just stays required every visit */
    }
  }, [orderNo])

  useEffect(() => {
    if (authReady && !user) router.replace(loginUrl(`/bayar/konsultasi?order_no=${orderNo}`))
  }, [authReady, user, router, orderNo])

  useEffect(() => {
    if (!orderNo) router.replace('/keranjang')
  }, [orderNo, router])

  if (!authReady || !user || !orderNo) return null
  if (loading) return null

  if (error || !order) {
    return (
      <Page title="Pesanan Tidak Ditemukan — ECC-BTS">
        <div className="pay-done">
          <FiXCircle className="pay-done__ic" style={{ color: 'var(--color-danger)' }} />
          <h1>Pesanan Tidak Ditemukan</h1>
          <p>{error || 'Pesanan tidak ditemukan.'}</p>
          <div className="pay-done__actions">
            <Link href="/keranjang" className="btn btn--blue btn--lg">
              Kembali ke Keranjang
            </Link>
          </div>
        </div>
      </Page>
    )
  }

  const itemTitles = order.items.map((it) => it.title_snapshot).join(', ')
  const waMessage = `Halo ECC-BTS, saya ingin konsultasi untuk pesanan ${order.order_no} (${itemTitles}). File sudah saya unggah.`

  const markConsulted = () => {
    setConfirmed(true)
    try {
      localStorage.setItem(confirmedKey(order.order_no), '1')
    } catch {
      /* storage unavailable — confirmation still holds for this page visit */
    }
  }

  return (
    <Page title="Konsultasi WhatsApp — ECC-BTS">
      <div className="pay-page pay-page--single">
        <div className="pay-main">
          <header className="pay-head">
            <BrandMark />
            <span className="pay-locale">
              <FiGlobe /> Bahasa Indonesia
            </span>
          </header>

          <CheckoutSteps active={3} />

          <div className="intro-card">
            <span className="intro-card__icon">
              <FiCheckCircle />
            </span>
            <div>
              <p className="intro-card__title">File berhasil diterima!</p>
              <p className="intro-card__text">
                File Anda telah kami terima. Silakan konsultasikan kebutuhan pesanan Anda melalui
                WhatsApp sebelum melakukan pembayaran.
              </p>
              <span className="intro-card__invoice">
                No. Pesanan <b>{order.order_no}</b>
              </span>
            </div>
          </div>

          <ul className="pay-summary__items">
            {order.items.map((it) => (
              <li key={it.id}>
                <span>
                  {it.title_snapshot}
                  {it.qty > 1 && <em> × {it.qty}</em>}
                </span>
              </li>
            ))}
          </ul>

          <a
            href={waLink(waMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--block btn--lg"
            style={{ background: '#25D366', color: '#fff' }}
            onClick={markConsulted}
          >
            <FaWhatsapp /> Konsultasi via WhatsApp
          </a>

          <button
            type="button"
            className="btn btn--primary btn--block btn--lg pay-confirm"
            disabled={!confirmed}
            onClick={() => router.push(`/bayar?order_no=${encodeURIComponent(order.order_no)}`)}
          >
            Sudah Konsultasi, Lanjut ke Pembayaran <FiArrowRight />
          </button>

          {!confirmed && (
            <p className="pay-section-hint" style={{ textAlign: 'center' }}>
              <FiCheckCircle /> Klik tombol WhatsApp di atas dulu untuk melanjutkan.
            </p>
          )}
        </div>
      </div>
    </Page>
  )
}

export default function Konsultasi() {
  return (
    <Suspense fallback={null}>
      <KonsultasiInner />
    </Suspense>
  )
}
