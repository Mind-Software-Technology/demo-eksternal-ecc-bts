'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { FiCalendar, FiMapPin, FiClock } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa6'
import Page from '../../../components/layout/Page'
import PageHero from '../../../components/sections/PageHero'
import CTABand from '../../../components/sections/CTABand'
import { RevealGroup, RevealItem } from '../../../components/ui/Reveal'
import { formatEventDate } from '../../../data/format'
import { waLink } from '../../../data/site'
import { api } from '../../../lib/api'

export default function Kegiatan() {
  const [categories, setCategories] = useState([])
  const [events, setEvents] = useState([])
  const [active, setActive] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [now] = useState(() => Date.now())

  useEffect(() => {
    Promise.all([api.categories.list().catch(() => []), api.events.list()])
      .then(([cats, items]) => {
        setCategories(cats)
        setEvents(items)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filters = [{ slug: 'all', title: 'Semua' }, ...categories]

  const filtered = useMemo(
    () => (active === 'all' ? events : events.filter((e) => e.category?.slug === active)),
    [events, active],
  )

  const { upcoming, past } = useMemo(
    () => ({
      upcoming: filtered.filter((e) => !e.starts_at || new Date(e.starts_at).getTime() >= now),
      past: filtered.filter((e) => e.starts_at && new Date(e.starts_at).getTime() < now),
    }),
    [filtered, now],
  )

  const renderCard = (e, isPast) => (
    <RevealItem key={e.id} className="event-card__wrap">
      <article className="event-card" data-accent={e.category?.accent}>
        <div className="event-card__media">
          {e.flyer_url ? (
            <img src={e.flyer_url} alt={e.title} loading="lazy" />
          ) : (
            <FiCalendar className="event-card__media-fallback" aria-hidden="true" />
          )}
          <span className={`event-card__status ${isPast ? 'is-past' : 'is-upcoming'}`}>
            {isPast ? 'Selesai' : 'Akan Datang'}
          </span>
          {e.category && <span className="event-card__cat">{e.category.title}</span>}
        </div>
        <div className="event-card__body">
          {/* Stretched link: judulnya saja yang jadi <a>, tapi ::after-nya
              menutupi seluruh kartu — jadi kartu bisa diklik tanpa membuat
              <a> bersarang di dalam tombol WhatsApp di bawah. */}
          <h3>
            <Link href={`/kegiatan/${e.id}`} className="event-card__link">
              {e.title}
            </Link>
          </h3>
          <div className="event-card__meta">
            {e.starts_at && (
              <span>
                <FiClock /> {formatEventDate(e.starts_at)} WIB
              </span>
            )}
            {e.location && (
              <span>
                <FiMapPin /> {e.location}
              </span>
            )}
          </div>
          {e.description && <p className="event-card__desc">{e.description}</p>}
          <a
            href={waLink(`Halo ECC, saya ingin bertanya tentang kegiatan "${e.title}".`)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--wa btn--sm"
          >
            <FaWhatsapp /> Tanya via WhatsApp
          </a>
        </div>
      </article>
    </RevealItem>
  )

  return (
    <Page title="Kegiatan — ECC">
      <PageHero
        title="Kegiatan & Acara"
        crumb="Kegiatan"
        subtitle="Ikuti workshop, webinar, dan agenda kolaborasi pendidikan dari ECC — terbaru dan yang sudah berlalu."
      />

      <section className="section">
        <div className="container">
          <div className="filter-tabs" role="tablist" aria-label="Filter kategori kegiatan">
            {filters.map((f) => (
              <button
                key={f.slug}
                type="button"
                role="tab"
                aria-selected={active === f.slug}
                className={`filter-tab ${active === f.slug ? 'active' : ''}`}
                onClick={() => setActive(f.slug)}
              >
                {f.title}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="empty-note">Memuat kegiatan…</p>
          ) : error ? (
            <p className="empty-note">Gagal memuat kegiatan: {error}</p>
          ) : filtered.length === 0 ? (
            <p className="empty-note">Belum ada kegiatan untuk kategori ini.</p>
          ) : (
            <>
              {upcoming.length > 0 && (
                <>
                  <h2 className="event-group-title">Akan Datang</h2>
                  <RevealGroup className="grid-events">
                    {upcoming.map((e) => renderCard(e, false))}
                  </RevealGroup>
                </>
              )}
              {past.length > 0 && (
                <>
                  <h2 className="event-group-title">Sudah Berlalu</h2>
                  <RevealGroup className="grid-events">
                    {past.map((e) => renderCard(e, true))}
                  </RevealGroup>
                </>
              )}
            </>
          )}
        </div>
      </section>

      <CTABand />
    </Page>
  )
}
