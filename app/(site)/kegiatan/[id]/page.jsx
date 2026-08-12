'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { FiCalendar, FiMapPin, FiClock, FiArrowLeft } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa6'
import Page from '../../../../components/layout/Page'
import PageHero from '../../../../components/sections/PageHero'
import CTABand from '../../../../components/sections/CTABand'
import Reveal from '../../../../components/ui/Reveal'
import { formatEventDate } from '../../../../data/format'
import { waLink } from '../../../../data/site'
import { api } from '../../../../lib/api'

export default function EventDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [event, setEvent] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState(null)
  // Dibekukan sekali saat mount — sama seperti di halaman daftar. Memanggil
  // Date.now() langsung saat render bikin render jadi tidak murni.
  const [now] = useState(() => Date.now())

  useEffect(() => {
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resets state before refetching on id change
    setEvent(null)
    setNotFound(false)
    setError(null)
    api.events
      .show(id)
      .then((data) => {
        if (!cancelled) setEvent(data)
      })
      .catch((e) => {
        if (cancelled) return
        // Hanya 404 yang berarti "kegiatannya memang tidak ada" — itu yang
        // pantas dipantulkan balik ke daftar. Error lain (API belum ter-deploy,
        // server mati, jaringan putus) harus terlihat: memantulkan diam-diam
        // membuat gangguan server tidak bisa dibedakan dari kegiatan terhapus,
        // dan halaman seolah menolak dibuka tanpa alasan.
        if (e.status === 404) setNotFound(true)
        else setError(e.message || 'Gagal memuat kegiatan.')
      })
    return () => {
      cancelled = true
    }
  }, [id])

  // Kegiatan tidak ada atau sudah dinonaktifkan admin → balik ke daftar.
  useEffect(() => {
    if (notFound) router.replace('/kegiatan')
  }, [notFound, router])

  if (error) {
    return (
      <Page title="Gagal Memuat Kegiatan — ECC">
        <PageHero
          title="Gagal Memuat Kegiatan"
          crumb="Kegiatan"
          subtitle="Detail kegiatan ini sedang tidak bisa diambil."
        />
        <section className="section">
          <div className="container" style={{ textAlign: 'center' }}>
            <p className="empty-note">{error}</p>
            <Link href="/kegiatan" className="btn btn--primary btn--lg">
              <FiArrowLeft /> Kembali ke daftar kegiatan
            </Link>
          </div>
        </section>
      </Page>
    )
  }

  if (!event) return null

  const isPast = event.starts_at && new Date(event.starts_at).getTime() < now

  return (
    <Page title={`${event.title} — ECC`}>
      <PageHero
        title={event.title}
        crumb={event.title}
        subtitle={event.category?.title ? `Kegiatan ${event.category.title}` : 'Kegiatan & Acara'}
      />

      <section className="section">
        <div className="container event-detail">
          <Reveal className="event-detail__media" data-accent={event.category?.accent}>
            {event.flyer_url ? (
              /* eslint-disable-next-line @next/next/no-img-element -- flyer diunggah admin, ukurannya tidak diketahui saat build */
              <img src={event.flyer_url} alt={event.title} decoding="async" />
            ) : (
              <FiCalendar className="event-detail__media-fallback" aria-hidden="true" />
            )}
            <span className={`event-card__status ${isPast ? 'is-past' : 'is-upcoming'}`}>
              {isPast ? 'Selesai' : 'Akan Datang'}
            </span>
          </Reveal>

          <Reveal className="event-detail__body" delay={0.1}>
            {event.category && <span className="product-row__tag">{event.category.title}</span>}
            <h2>{event.title}</h2>

            <dl className="event-detail__meta">
              {event.starts_at && (
                <div>
                  <dt>
                    <FiClock /> Mulai
                  </dt>
                  <dd>{formatEventDate(event.starts_at)} WIB</dd>
                </div>
              )}
              {event.ends_at && (
                <div>
                  <dt>
                    <FiClock /> Selesai
                  </dt>
                  <dd>{formatEventDate(event.ends_at)} WIB</dd>
                </div>
              )}
              {event.location && (
                <div>
                  <dt>
                    <FiMapPin /> Lokasi
                  </dt>
                  <dd>{event.location}</dd>
                </div>
              )}
            </dl>

            {event.description && (
              <div className="event-detail__desc">
                {event.description
                  .split(/\n{2,}/)
                  .map((paragraph, i) => <p key={i}>{paragraph}</p>)}
              </div>
            )}

            <a
              href={waLink(`Halo ECC, saya ingin bertanya tentang kegiatan "${event.title}".`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--wa btn--lg"
            >
              <FaWhatsapp /> Tanya via WhatsApp
            </a>

            <Link href="/kegiatan" className="product-detail__back">
              <FiArrowLeft /> Kembali ke daftar kegiatan
            </Link>
          </Reveal>
        </div>
      </section>

      <CTABand />
    </Page>
  )
}
