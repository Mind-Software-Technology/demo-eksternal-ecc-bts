'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { FiGlobe, FiArrowLeft, FiArrowRight, FiXCircle, FiFileText, FiCheckCircle, FiUpload, FiX, FiAlertCircle } from 'react-icons/fi'
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
 * files upload together (one request per file, via POST
 * /orders/{order_no}/items/{item}/attachment) when the customer taps
 * "Lanjut Konsultasi WhatsApp". The WhatsApp consultation happens after
 * that, at /bayar/konsultasi.
 *
 * Items ordered with qty > 1 can carry up to `qty` files — one per unit —
 * queued and uploaded the same way, tracked as "n/qty" per item.
 */
function UploadInner() {
  const searchParams = useSearchParams()
  const orderNo = searchParams.get('order_no')
  const { user, ready: authReady } = useAuth()
  const router = useRouter()

  const [order, setOrder] = useState(() => takeCachedOrder(orderNo))
  const [loading, setLoading] = useState(!order)
  const [loadError, setLoadError] = useState(null)
  // Files queued per item but not sent yet — { [itemId]: Array<{ localId, file }> }.
  // They all upload together when "Lanjut Konsultasi WhatsApp" is tapped.
  const [pending, setPending] = useState({})
  const [previewUrls, setPreviewUrls] = useState({}) // keyed by localId
  const [submitting, setSubmitting] = useState(false)
  const [itemErrors, setItemErrors] = useState({})
  const nextLocalId = useRef(0)

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

  const patchItem = (updatedItem) => {
    setOrder((o) => ({
      ...o,
      items: o.items.map((it) => (it.id === updatedItem.id ? updatedItem : it)),
    }))
  }

  const revokePreview = (localId) => {
    setPreviewUrls((p) => {
      if (!p[localId]) return p
      URL.revokeObjectURL(p[localId])
      const { [localId]: _removed, ...rest } = p
      return rest
    })
  }

  const cancelPending = (item, localId) => {
    revokePreview(localId)
    setPending((p) => ({
      ...p,
      [item.id]: (p[item.id] || []).filter((q) => q.localId !== localId),
    }))
  }

  const remainingSlots = (item) => {
    const uploaded = item.attachments_count ?? (item.has_attachment ? 1 : 0)
    const queued = (pending[item.id] || []).length
    return Math.max(item.qty - uploaded - queued, 0)
  }

  // Picking a file queues it locally — nothing uploads yet. All queued files
  // are sent together in handleContinue, once the customer taps "Lanjut
  // Konsultasi WhatsApp".
  const handleSelect = (item, file) => {
    if (!file) return
    setItemErrors((e) => ({ ...e, [item.id]: null }))

    if (file.size > MAX_FILE_BYTES) {
      setItemErrors((e) => ({ ...e, [item.id]: 'Ukuran file maksimal 50MB.' }))
      return
    }
    if (remainingSlots(item) <= 0) return

    const localId = nextLocalId.current++
    if (isPreviewableType(file.type)) {
      setPreviewUrls((p) => ({ ...p, [localId]: URL.createObjectURL(file) }))
    }
    setPending((p) => ({ ...p, [item.id]: [...(p[item.id] || []), { localId, file }] }))
  }

  const deleteUploaded = async (item, attachmentId) => {
    try {
      const updated = await api.orders.deleteAttachment(order.order_no, item.id, attachmentId)
      patchItem(updated)
    } catch (err) {
      setItemErrors((e) => ({ ...e, [item.id]: err.message || 'Gagal menghapus file.' }))
    }
  }

  // Uploads every queued file (one request each), then moves on to the
  // consultation step — only once all of them succeed. A failed file keeps
  // its queued preview and shows the item's error, so the customer can retry
  // without re-picking files that already went through.
  const handleContinue = async () => {
    const entries = Object.entries(pending).flatMap(([itemId, files]) =>
      files.map((q) => ({ itemId, ...q })),
    )
    if (entries.length === 0) {
      router.push(`/bayar/konsultasi?order_no=${encodeURIComponent(order.order_no)}`)
      return
    }

    setSubmitting(true)
    setItemErrors({})

    const results = await Promise.allSettled(
      entries.map((entry) => api.orders.uploadAttachment(order.order_no, entry.itemId, entry.file)),
    )

    const failed = {}
    const succeededLocalIds = new Set()
    results.forEach((result, i) => {
      const entry = entries[i]
      if (result.status === 'rejected') {
        failed[entry.itemId] = result.reason?.message || 'Gagal mengunggah file. Coba lagi.'
      } else {
        patchItem(result.value)
        succeededLocalIds.add(entry.localId)
      }
    })

    // Clear only the files that actually went through — failed ones stay
    // queued for retry.
    setPending((p) => {
      const next = {}
      for (const [itemId, files] of Object.entries(p)) {
        const remaining = files.filter((q) => !succeededLocalIds.has(q.localId))
        if (remaining.length > 0) next[itemId] = remaining
      }
      return next
    })
    succeededLocalIds.forEach((localId) => revokePreview(localId))

    setSubmitting(false)

    if (Object.keys(failed).length > 0) {
      setItemErrors(failed)
      return
    }

    router.push(`/bayar/konsultasi?order_no=${encodeURIComponent(order.order_no)}`)
  }

  const missingRequired = order.items.find((it) => {
    if (!it.requires_attachment) return false
    const uploaded = it.attachments_count ?? (it.has_attachment ? 1 : 0)
    const queued = (pending[it.id] || []).length
    return uploaded + queued === 0
  })
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
            nama filenya saja. Jika satu layanan dipesan lebih dari satu (qty &gt; 1), Anda bisa
            mengunggah file sebanyak jumlah yang dipesan — satu file per unit.
          </p>
          <p className="upload-required-note">
            <FiAlertCircle /> Upload file sebelum konsultasi — konsultasi WhatsApp baru bisa
            dilanjutkan setelah file untuk layanan yang membutuhkannya sudah diunggah.
          </p>

          {order.items.map((it) => {
            const uploaded = it.attachments ?? (it.has_attachment
              ? [{ id: null, original_name: it.attachment_original_name }]
              : [])
            const uploadedCount = it.attachments_count ?? uploaded.length
            const queued = pending[it.id] || []
            const slotsLeft = remainingSlots(it)

            return (
              <div className="upload-item" key={it.id}>
                <div className="upload-item__head">
                  <label htmlFor={`file-${it.id}`} className="upload-item__title">
                    {it.title_snapshot}
                  </label>
                  {it.qty > 1 ? (
                    <span className="upload-item__badge">
                      {uploadedCount + queued.length}/{it.qty} file
                    </span>
                  ) : (
                    uploadedCount > 0 && (
                      <span className="upload-item__badge upload-item__badge--done">
                        <FiCheckCircle /> Sudah diunggah
                      </span>
                    )
                  )}
                </div>

                {/* Already uploaded to the server. */}
                {uploaded.map((a, idx) => (
                  <div className="file-preview" key={a.id ?? `legacy-${idx}`}>
                    <FiFileText className="file-preview__ic" />
                    <div className="file-preview__meta">
                      <span className="file-preview__name">{a.original_name}</span>
                    </div>
                    {a.id !== null && !submitting && (
                      <div className="file-preview__actions">
                        <button
                          type="button"
                          className="file-preview__clear"
                          onClick={() => deleteUploaded(it, a.id)}
                        >
                          <FiX /> Hapus
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {/* Picked but not sent yet — preview + confirm/cancel. */}
                {queued.map(({ localId, file }) => (
                  <div className="file-preview file-preview--pending" key={localId}>
                    {previewUrls[localId] ? (
                      file.type === 'application/pdf' ? (
                        <iframe src={previewUrls[localId]} title={file.name} className="file-preview__pdf" />
                      ) : (
                        <img src={previewUrls[localId]} alt="" className="file-preview__thumb" />
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
                          onClick={() => cancelPending(it, localId)}
                        >
                          <FiX /> Batal
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {itemErrors[it.id] && <p className="auth-modal__error">{itemErrors[it.id]}</p>}

                {slotsLeft > 0 && (
                  <input
                    key={`${it.id}-${uploadedCount}-${queued.length}`}
                    id={`file-${it.id}`}
                    type="file"
                    disabled={submitting}
                    accept="image/jpeg,image/png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => handleSelect(it, e.target.files?.[0] || null)}
                  />
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
