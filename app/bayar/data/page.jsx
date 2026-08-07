'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { FiGlobe, FiArrowLeft, FiArrowRight, FiXCircle } from 'react-icons/fi'
import Page from '../../../components/layout/Page'
import BrandMark from '../../../components/layout/BrandMark'
import CheckoutSteps from '../../../components/layout/CheckoutSteps'
import { useCart } from '../../../context/cart'
import { useAuth, loginUrl } from '../../../context/auth'
import { api } from '../../../lib/api'
import { setCachedOrder } from '../../../lib/checkoutOrderCache'

/**
 * Checkout step 1 — collect orderer info and create the order. The order is
 * created here (before the WhatsApp consultation) so there's already an
 * order_no + item list for the admin to price during the chat; attachments
 * are uploaded later at /bayar/upload, after the customer returns from WA.
 *
 * Also doubles as the "Ubah data pemesan" edit screen reached later from the
 * payment page (?order_no=...) — only the name can be corrected there.
 */
function OrdererDataInner() {
  const searchParams = useSearchParams()
  const editOrderNo = searchParams.get('order_no')
  const isEdit = Boolean(editOrderNo)

  const { detailed, ready } = useCart()
  const { user, ready: authReady } = useAuth()
  const router = useRouter()

  const [guest, setGuest] = useState({ guest_name: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const [, setOrder] = useState(null)
  const [orderLoading, setOrderLoading] = useState(isEdit)
  const [orderError, setOrderError] = useState(null)

  // Edit mode: load the existing order and pre-fill from it.
  useEffect(() => {
    if (!isEdit || !user) return
    let cancelled = false
    api.orders
      .show(editOrderNo)
      .then((data) => {
        if (cancelled) return
        setOrder(data)
        setGuest({ guest_name: data.guest_name || '' })
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
  }, [isEdit, editOrderNo, user])

  // Checkout is account-only — bounce a logged-out visitor to login.
  useEffect(() => {
    if (authReady && !user) {
      router.replace(loginUrl(isEdit ? `/bayar/data?order_no=${editOrderNo}` : '/bayar/data'))
    }
  }, [authReady, user, router, isEdit, editOrderNo])

  // Reached with an empty cart (e.g. direct URL / refresh) — irrelevant in
  // edit mode, where there's an existing order instead of a cart to draw from.
  useEffect(() => {
    if (!isEdit && user && ready && detailed.length === 0) router.replace('/keranjang')
  }, [isEdit, user, ready, detailed.length, router])

  // Pre-fill name from the logged-in account as a convenience for a fresh
  // order — still editable. Edit mode pre-fills from the order instead.
  useEffect(() => {
    if (isEdit || !user) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- prefills from the account once auth resolves, still user-editable
    setGuest((g) => ({ ...g, guest_name: g.guest_name || user.name || '' }))
  }, [isEdit, user])

  if (!authReady || !user) return null
  if (isEdit && orderLoading) return null
  if (!isEdit && (!ready || detailed.length === 0)) return null

  if (isEdit && orderError) {
    return (
      <Page title="Pesanan Tidak Ditemukan — ECC-BTS">
        <div className="pay-done">
          <FiXCircle className="pay-done__ic" style={{ color: 'var(--color-danger)' }} />
          <h1>Pesanan Tidak Ditemukan</h1>
          <p>{orderError}</p>
          <div className="pay-done__actions">
            <Link href="/keranjang" className="btn btn--blue btn--lg">
              Kembali ke Keranjang
            </Link>
          </div>
        </div>
      </Page>
    )
  }

  const submit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!guest.guest_name.trim()) {
      setError('Nama wajib diisi.')
      return
    }

    setBusy(true)
    try {
      if (isEdit) {
        const updated = await api.orders.update(editOrderNo, {
          guest_name: guest.guest_name,
        })
        setCachedOrder(updated)
        router.push(`/bayar?order_no=${encodeURIComponent(editOrderNo)}`)
      } else {
        const created = await api.orders.create({
          guest_name: guest.guest_name,
        })
        setCachedOrder(created)
        router.push(`/bayar/konsultasi?order_no=${encodeURIComponent(created.order_no)}`)
      }
    } catch (err) {
      setError(err.message || 'Gagal menyimpan data pemesan. Coba lagi.')
      setBusy(false)
    }
  }

  return (
    <Page title={isEdit ? 'Ubah Data Pemesan — ECC-BTS' : 'Data Pemesan — ECC-BTS'}>
      <form className="pay-page pay-page--single" onSubmit={submit}>
        {/* ---------------------------------------------------- main column */}
        <div className="pay-main">
          <header className="pay-head">
            <BrandMark />
            <span className="pay-locale">
              <FiGlobe /> Bahasa Indonesia
            </span>
          </header>

          <CheckoutSteps active={1} />

          {error && <p className="auth-modal__error">{error}</p>}

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

          {!isEdit && (
            <p className="pay-section-hint">
              Setelah ini Anda akan diarahkan untuk konsultasi singkat lewat WhatsApp sebelum
              mengunggah file/dokumen pesanan Anda.
            </p>
          )}

          <button type="submit" className="btn btn--primary btn--block btn--lg pay-confirm" disabled={busy}>
            {busy
              ? 'Menyimpan…'
              : isEdit
                ? 'Simpan & Kembali ke Pembayaran'
                : 'Lanjut Konsultasi WhatsApp'}{' '}
            {!busy && <FiArrowRight />}
          </button>

          <Link
            href={isEdit ? `/bayar?order_no=${encodeURIComponent(editOrderNo)}` : '/keranjang'}
            className="pay-back"
          >
            <FiArrowLeft /> {isEdit ? 'Batal, kembali ke pembayaran' : 'Kembali ke keranjang'}
          </Link>
        </div>
      </form>
    </Page>
  )
}

export default function OrdererData() {
  return (
    <Suspense fallback={null}>
      <OrdererDataInner />
    </Suspense>
  )
}
