'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { FiGlobe, FiArrowLeft, FiArrowRight, FiXCircle, FiFileText, FiCheckCircle } from 'react-icons/fi'
import Page from '../../../components/layout/Page'
import BrandMark from '../../../components/layout/BrandMark'
import CheckoutSteps from '../../../components/layout/CheckoutSteps'
import { useAuth, loginUrl } from '../../../context/auth'
import { api } from '../../../lib/api'
import { takeCachedOrder } from '../../../lib/checkoutOrderCache'

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Checkout step 3 — upload the attachment for each order item, now that the
 * WhatsApp consultation is done. Each file uploads immediately on selection
 * (one request per item, via POST /orders/{order_no}/items/{item}/attachment)
 * rather than a single bundled submit, since items are already saved.
 */
function UploadInner() {
  const searchParams = useSearchParams()
  const orderNo = searchParams.get('order_no')
  const { user, ready: authReady } = useAuth()
  const router = useRouter()

  const [order, setOrder] = useState(() => takeCachedOrder(orderNo))
  const [loading, setLoading] = useState(!order)
  const [loadError, setLoadError] = useState(null)
  const [previewUrls, setPreviewUrls] = useState({})
  const [uploadingId, setUploadingId] = useState(null)
  const [itemErrors, setItemErrors] = useState({})

  const reload = () => {
    if (!orderNo) return
    api.orders
      .show(orderNo)
      .then(setOrder)
      .catch((err) => setLoadError(err.message || 'Pesanan tidak ditemukan.'))
  }

  useEffect(() => {
    if (!orderNo || !user || order) return
    setLoading(true)
    api.orders
      .show(orderNo)
      .then(setOrder)
      .catch((err) => setLoadError(err.message || 'Pesanan tidak ditemukan.'))
      .finally(() => setLoading(false))
  }, [orderNo, user, order])

  useEffect(() => {
    if (authReady && !user) router.replace(loginUrl(`/bayar/upload?order_no=${orderNo}`))
  }, [authReady, user, router, orderNo])

  useEffect(() => {
    if (!orderNo) router.replace('/keranjang')
  }, [orderNo, router])

  if (!authReady || !user || !orderNo) return null
  if (loading) return null

  if (loadError || !order) {
    return (
      <Page title="Pesanan Tidak Ditemukan — ECC-BTS">
        <div className="pay-done">
          <FiXCircle className="pay-done__ic" style={{ color: 'var(--color-danger)' }} />
          <h1>Pesanan Tidak Ditemukan</h1>
          <p>{loadError || 'Pesanan tidak ditemukan.'}</p>
          <div className="pay-done__actions">
            <Link href="/keranjang" className="btn btn--blue btn--lg">
              Kembali ke Keranjang
            </Link>
          </div>
        </div>
      </Page>
    )
  }

  const handleFile = async (item, file) => {
    if (!file) return

    if (file.type.startsWith('image/')) {
      setPreviewUrls((p) => ({ ...p, [item.id]: URL.createObjectURL(file) }))
    }
    setItemErrors((e) => ({ ...e, [item.id]: null }))
    setUploadingId(item.id)
    try {
      await api.orders.uploadAttachment(order.order_no, item.id, file)
      reload()
    } catch (err) {
      setItemErrors((e) => ({ ...e, [item.id]: err.message || 'Gagal mengunggah file. Coba lagi.' }))
    } finally {
      setUploadingId(null)
    }
  }

  const missingRequired = order.items.find((it) => it.requires_attachment && !it.has_attachment)
  const canFinish = !missingRequired

  return (
    <Page title="Unggah File — ECC-BTS">
      <div className="pay-page pay-page--single">
        <div className="pay-main">
          <header className="pay-head">
            <BrandMark />
            <span className="pay-locale">
              <FiGlobe /> Bahasa Indonesia
            </span>
          </header>

          <CheckoutSteps active={3} />

          <h2 className="pay-section-label">Unggah File / Dokumen</h2>
          <p className="pay-section-hint">
            Unggah naskah/dokumen/data untuk setiap layanan yang dipesan. Format: PDF, DOC(X), JPG,
            PNG — maks. 10MB.
          </p>

          {order.items.map((it) => (
            <div className="field" key={it.id}>
              <label htmlFor={`file-${it.id}`}>
                {it.title_snapshot}
                {!it.requires_attachment && ' (opsional)'}
                {it.has_attachment && (
                  <span style={{ color: 'var(--color-success, #16a34a)', marginLeft: 8 }}>
                    <FiCheckCircle /> Sudah diunggah
                  </span>
                )}
              </label>
              <input
                key={uploadingId === it.id ? 'uploading' : it.has_attachment ? 'uploaded' : 'empty'}
                id={`file-${it.id}`}
                type="file"
                disabled={uploadingId === it.id}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => handleFile(it, e.target.files?.[0] || null)}
              />
              {uploadingId === it.id && <p className="pay-section-hint">Mengunggah…</p>}
              {itemErrors[it.id] && <p className="auth-modal__error">{itemErrors[it.id]}</p>}
              {it.has_attachment && it.attachment_original_name && (
                <div className="file-preview">
                  {previewUrls[it.id] ? (
                    <img src={previewUrls[it.id]} alt="" className="file-preview__thumb" />
                  ) : (
                    <FiFileText className="file-preview__ic" />
                  )}
                  <div className="file-preview__meta">
                    <span className="file-preview__name">{it.attachment_original_name}</span>
                  </div>
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            className="btn btn--primary btn--block btn--lg pay-confirm"
            disabled={!canFinish}
            onClick={() => router.push('/riwayat-pembayaran')}
          >
            Selesai <FiArrowRight />
          </button>
          {!canFinish && (
            <p className="pay-section-hint">
              Lengkapi dulu file yang wajib diunggah sebelum melanjutkan.
            </p>
          )}

          <Link href={`/bayar/konsultasi?order_no=${encodeURIComponent(order.order_no)}`} className="pay-back">
            <FiArrowLeft /> Kembali ke halaman konsultasi
          </Link>
        </div>
      </div>
    </Page>
  )
}

export default function Upload() {
  return (
    <Suspense fallback={null}>
      <UploadInner />
    </Suspense>
  )
}
