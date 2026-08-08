'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { FiGlobe, FiArrowLeft, FiArrowRight, FiXCircle, FiFileText, FiCheckCircle, FiUpload, FiX } from 'react-icons/fi'
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

const MAX_FILE_BYTES = 50 * 1024 * 1024

function isPreviewableType(type) {
  return type.startsWith('image/') || type === 'application/pdf'
}

/**
 * Checkout step 2 — upload the attachment for each order item, right after
 * the order is created. Each file uploads immediately on selection (one
 * request per item, via POST /orders/{order_no}/items/{item}/attachment)
 * rather than a single bundled submit, since items are already saved. The
 * WhatsApp consultation happens after this, at /bayar/konsultasi.
 */
function UploadInner() {
  const searchParams = useSearchParams()
  const orderNo = searchParams.get('order_no')
  const { user, ready: authReady } = useAuth()
  const router = useRouter()

  const [order, setOrder] = useState(() => takeCachedOrder(orderNo))
  const [loading, setLoading] = useState(!order)
  const [loadError, setLoadError] = useState(null)
  // Files picked but not sent yet — the customer previews them here first
  // and confirms with "Kirim File" before anything actually uploads.
  const [pending, setPending] = useState({})
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

  // Revoke preview object URLs on unmount so they don't leak memory.
  useEffect(() => {
    return () => {
      Object.values(previewUrls).forEach((url) => URL.revokeObjectURL(url))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cleanup-only effect, intentionally reads the latest ref via closure at unmount
  }, [])

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

  const revokePreview = (itemId) => {
    setPreviewUrls((p) => {
      if (p[itemId]) URL.revokeObjectURL(p[itemId])
      const { [itemId]: _removed, ...rest } = p
      return rest
    })
  }

  // Step 1: pick a file — just previews it, nothing is sent to the server yet.
  const handleSelect = (item, file) => {
    if (!file) return
    setItemErrors((e) => ({ ...e, [item.id]: null }))

    if (file.size > MAX_FILE_BYTES) {
      setItemErrors((e) => ({ ...e, [item.id]: 'Ukuran file maksimal 50MB.' }))
      return
    }

    revokePreview(item.id)
    if (isPreviewableType(file.type)) {
      setPreviewUrls((p) => ({ ...p, [item.id]: URL.createObjectURL(file) }))
    }
    setPending((p) => ({ ...p, [item.id]: file }))
  }

  const cancelPending = (item) => {
    revokePreview(item.id)
    setPending((p) => {
      const { [item.id]: _removed, ...rest } = p
      return rest
    })
  }

  // Step 2: customer reviewed the preview and confirms — only now does the
  // file actually upload.
  const sendFile = async (item) => {
    const file = pending[item.id]
    if (!file) return

    setUploadingId(item.id)
    try {
      await api.orders.uploadAttachment(order.order_no, item.id, file)
      cancelPending(item)
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

          <CheckoutSteps active={2} />

          <h2 className="pay-section-label">Unggah File / Dokumen</h2>
          <p className="pay-section-hint">
            Unggah naskah/dokumen/data untuk setiap layanan yang dipesan. Format: PDF, DOC(X), JPG,
            PNG — maks. 50MB. Anda bisa melihat pratinjau file sebelum benar-benar mengirimkannya.
          </p>

          {order.items.map((it) => {
            const file = pending[it.id]
            const isUploading = uploadingId === it.id

            return (
              <div className="field" key={it.id}>
                <label htmlFor={`file-${it.id}`}>
                  {it.title_snapshot}
                  {!it.requires_attachment && ' (opsional)'}
                  {it.has_attachment && !file && (
                    <span style={{ color: 'var(--color-success, #16a34a)', marginLeft: 8 }}>
                      <FiCheckCircle /> Sudah diunggah
                    </span>
                  )}
                </label>

                {!file && (
                  <input
                    key={it.has_attachment ? 'uploaded' : 'empty'}
                    id={`file-${it.id}`}
                    type="file"
                    disabled={isUploading}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => handleSelect(it, e.target.files?.[0] || null)}
                  />
                )}

                {itemErrors[it.id] && <p className="auth-modal__error">{itemErrors[it.id]}</p>}

                {/* Picked but not sent yet — preview + confirm/cancel. */}
                {file && (
                  <div className="file-preview file-preview--pending">
                    {previewUrls[it.id] ? (
                      file.type === 'application/pdf' ? (
                        <iframe src={previewUrls[it.id]} title={file.name} className="file-preview__pdf" />
                      ) : (
                        <img src={previewUrls[it.id]} alt="" className="file-preview__thumb" />
                      )
                    ) : (
                      <FiFileText className="file-preview__ic" />
                    )}
                    <div className="file-preview__meta">
                      <span className="file-preview__name">{file.name}</span>
                      <span className="file-preview__size">{formatFileSize(file.size)}</span>
                    </div>
                    <div className="file-preview__actions">
                      <button
                        type="button"
                        className="btn btn--primary btn--sm"
                        onClick={() => sendFile(it)}
                        disabled={isUploading}
                      >
                        <FiUpload /> {isUploading ? 'Mengirim…' : 'Kirim File'}
                      </button>
                      <button
                        type="button"
                        className="file-preview__clear"
                        onClick={() => cancelPending(it)}
                        disabled={isUploading}
                      >
                        <FiX /> Batal
                      </button>
                    </div>
                  </div>
                )}

                {/* Already uploaded, nothing pending to preview. */}
                {!file && it.has_attachment && it.attachment_original_name && (
                  <div className="file-preview">
                    <FiFileText className="file-preview__ic" />
                    <div className="file-preview__meta">
                      <span className="file-preview__name">{it.attachment_original_name}</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          <button
            type="button"
            className="btn btn--primary btn--block btn--lg pay-confirm"
            disabled={!canFinish}
            onClick={() => router.push(`/bayar/konsultasi?order_no=${encodeURIComponent(order.order_no)}`)}
          >
            Lanjut Konsultasi WhatsApp <FiArrowRight />
          </button>
          {!canFinish && (
            <p className="pay-section-hint">
              Lengkapi dulu file yang wajib diunggah sebelum melanjutkan.
            </p>
          )}

          <Link href={`/bayar/data?order_no=${encodeURIComponent(order.order_no)}`} className="pay-back">
            <FiArrowLeft /> Ubah data pemesan
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
