'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { FiGlobe, FiArrowLeft, FiArrowRight, FiXCircle } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa6'
import Page from '../../../components/layout/Page'
import BrandMark from '../../../components/layout/BrandMark'
import CheckoutSteps from '../../../components/layout/CheckoutSteps'
import { useAuth, loginUrl } from '../../../context/auth'
import { api } from '../../../lib/api'
import { waLink } from '../../../data/site'
import { takeCachedOrder } from '../../../lib/checkoutOrderCache'

/**
 * Checkout step 2 — a pause screen between order creation and file upload.
 * WhatsApp can't call back into the browser once opened, so the customer
 * confirms manually with "Sudah konsultasi, lanjut isi file" once they're
 * done chatting with admin about pricing.
 */
function KonsultasiInner() {
  const searchParams = useSearchParams()
  const orderNo = searchParams.get('order_no')
  const { user, ready: authReady } = useAuth()
  const router = useRouter()

  const [order, setOrder] = useState(() => takeCachedOrder(orderNo))
  const [loading, setLoading] = useState(!order)
  const [error, setError] = useState(null)

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
  const waMessage = `Halo ECC-BTS, saya ingin konsultasi untuk pesanan ${order.order_no} (${itemTitles}).`
  const continueUrl = `/bayar/upload?order_no=${encodeURIComponent(order.order_no)}`

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

          <CheckoutSteps active={2} />

          <h2 className="pay-section-label">Konsultasi Dulu Yuk!</h2>
          <p className="pay-section-hint">
            Sebelum lanjut isi file, konsultasikan kebutuhan pesanan Anda dengan tim kami lewat
            WhatsApp — harga akan disepakati di sesi ini dan diinput oleh admin. Nomor pesanan Anda:{' '}
            <strong>{order.order_no}</strong>
          </p>

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
          >
            <FaWhatsapp /> Konsultasi via WhatsApp
          </a>

          <button
            type="button"
            className="btn btn--primary btn--block btn--lg pay-confirm"
            onClick={() => router.push(continueUrl)}
          >
            Sudah Konsultasi, Lanjut Isi File <FiArrowRight />
          </button>

          <Link href="/riwayat-pembayaran" className="pay-back">
            <FiArrowLeft /> Lanjut nanti, lihat riwayat pesanan
          </Link>
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
