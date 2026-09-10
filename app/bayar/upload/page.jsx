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
 * Checkout step 2 — attach a file for each order item, right after the
 * order is created. Picking a file only previews it locally; all pending
 * files upload together (one request per item, via POST
 * /orders/{order_no}/items/{item}/attachment) when the customer taps
 * "Lanjut Konsultasi WhatsApp". The WhatsApp consultation happens after
 * that, at /bayar/konsultasi.
 */
function UploadInner() {
  const searchParams = useSearchParams()
  const orderNo = searchParams.get('order_no')
  const { user, ready: authReady } = useAuth()
  const router = useRouter()

  const [order, setOrder] = useState(() => takeCachedOrder(orderNo))
  const [loading, setLoading] = useState(!order)
  const [loadError, setLoadError] = useState(null)
  // Files picked but not sent yet — the customer previews them here first;
  // they all upload together when "Lanjut Konsultasi WhatsApp" is tapped.
  const [pending, setPending] = useState({})
  const [previewUrls, setPreviewUrls] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [itemErrors, setItemErrors] = useState({})

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

  const cancelPending = (item) => {
    revokePreview(item.id)
    setPending((p) => {
      const { [item.id]: _removed, ...rest } = p
      return rest
    })
  }

  // Picking a file only previews it — nothing uploads yet. All pending files
  // are sent together in handleContinue, once the customer taps "Lanjut
  // Konsultasi WhatsApp".
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

  // Uploads every pending file, then moves on to the consultation step —
  // only once all of them succeed. A failed item keeps its pending preview
  // and shows its error, so the customer can retry without re-picking files
  // that already went through.
  const handleContinue = async () => {
    const entries = Object.entries(pending)
    if (entries.length === 0) {
      router.push(`/bayar/konsultasi?order_no=${encodeURIComponent(order.order_no)}`)
      return
    }

    setSubmitting(true)
    setItemErrors({})

    const results = await Promise.allSettled(
      entries.map(([itemId, file]) => api.orders.uploadAttachment(order.order_no, itemId, file)),
    )

    const failed = {}
    results.forEach((result, i) => {
      if (result.status === 'rejected') {
        const [itemId] = entries[i]
        failed[itemId] = result.reason?.message || 'Gagal mengunggah file. Coba lagi.'
      }
    })

    setSubmitting(false)

    if (Object.keys(failed).length > 0) {
      setItemErrors(failed)
      return
    }

    router.push(`/bayar/konsultasi?order_no=${encodeURIComponent(order.order_no)}`)
  }

  const missingRequired = order.items.find(
    (it) => it.requires_attachment && !it.has_attachment && !pending[it.id],
  )
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
            PNG — maks. 50MB. Sebelum benar-benar mengirim, Anda bisa memeriksa dulu file yang
            dipilih: PDF dan gambar tampil pratinjau isinya, sedangkan Word (DOC/DOCX) tampil sebagai
            nama filenya saja.
          </p>

          {order.items.map((it) => {
            const file = pending[it.id]

            return (
              <div className="upload-item" key={it.id}>
                <div className="upload-item__head">
                  <label htmlFor={`file-${it.id}`} className="upload-item__title">
                    {it.title_snapshot}
                  </label>
                  {it.has_attachment && !file ? (
                    <span className="upload-item__badge upload-item__badge--done">
                      <FiCheckCircle /> Sudah diunggah
                    </span>
                  ) : (
                    !it.requires_attachment && (
                      <span className="upload-item__badge">Opsional</span>
                    )
                  )}
                </div>

                {!file && (
                  <input
                    key={it.has_attachment ? 'uploaded' : 'empty'}
                    id={`file-${it.id}`}
                    type="file"
                    disabled={submitting}
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
                      {submitting ? (
                        <span className="pay-qr__hint">
                          <FiUpload /> Mengunggah…
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="file-preview__clear"
                          onClick={() => cancelPending(it)}
                        >
                          <FiX /> Batal
                        </button>
                      )}
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
            disabled={!canFinish || submitting}
            onClick={handleContinue}
          >
            {submitting ? (
              'Mengunggah file…'
            ) : (
              <>
                Lanjut Konsultasi WhatsApp <FiArrowRight />
              </>
            )}
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
