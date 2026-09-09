'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { api } from '../../lib/api'
import ServiceCard from '../ui/ServiceCard'

const SLIDE_INTERVAL_MS = 5000

/** Shortest signed distance from `index` to `active`, wrapping around `length`. */
function wrappedOffset(index, active, length) {
  let diff = index - active
  if (diff > length / 2) diff -= length
  if (diff < -length / 2) diff += length
  return diff
}

function slideStyle(offset) {
  const abs = Math.abs(offset)
  if (abs > 2) {
    return { transform: `translateX(${offset * 60}%) scale(0.5)`, opacity: 0, zIndex: 0 }
  }
  const opacity = abs === 0 ? 1 : abs === 1 ? 0.55 : 0.25
  const scale = 1 - abs * 0.22
  return {
    transform: `translateX(${offset * 46}%) scale(${scale})`,
    opacity,
    zIndex: 10 - abs,
  }
}

/** Hero visual: 3D coverflow of event flyers (landscape), auto-advancing
 * every 5s. Falls back to featured services when there's no kegiatan to show. */
export default function HeroEventCard() {
  const [slides, setSlides] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [index, setIndex] = useState(0)
  const [fallbackServices, setFallbackServices] = useState([])

  useEffect(() => {
    api.events
      .list()
      .then((items) => {
        const withFlyer = items
          .filter((e) => e.flyer_url)
          .map((e) => ({ src: e.flyer_url, alt: e.title, title: e.title }))
        setSlides(withFlyer)
      })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  useEffect(() => {
    if (!loaded || slides.length > 0) return
    api.services
      .list({ limit: 2 })
      .then(({ items }) => setFallbackServices(items))
      .catch(() => {})
  }, [loaded, slides.length])

  // Auto-advance stays on; restarting the timer on `index` means a manual
  // pick (below) also gets a full interval before the next auto-advance,
  // instead of being cut short by whatever was already in flight.
  useEffect(() => {
    if (slides.length < 2) return undefined
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length)
    }, SLIDE_INTERVAL_MS)
    return () => clearInterval(id)
  }, [slides.length, index])

  if (loaded && slides.length === 0) {
    if (fallbackServices.length === 0) return null

    return (
      <div className="hero-event-card__fallback">
        {fallbackServices.map((s) => (
          <ServiceCard key={s.id} service={s} />
        ))}
      </div>
    )
  }

  if (slides.length === 0) return null

  const goToSlide = (i) => setIndex(((i % slides.length) + slides.length) % slides.length)
  const goToPrev = () => goToSlide(index - 1)
  const goToNext = () => goToSlide(index + 1)

  return (
    <div className="event-coverflow">
      <div className="event-coverflow__track">
        {slides.map((slide, i) => {
          const offset = wrappedOffset(i, index, slides.length)
          const isCenter = offset === 0
          return (
            <Link
              key={slide.src}
              href="/kegiatan"
              className="event-coverflow__slide"
              aria-label={isCenter ? `Lihat kegiatan: ${slide.title || 'ECC'}` : 'Lihat kegiatan ECC'}
              aria-hidden={Math.abs(offset) > 2}
              tabIndex={isCenter ? 0 : -1}
              style={slideStyle(offset)}
            >
              <img src={slide.src} alt={slide.alt || ''} loading="lazy" />
              {slide.title && <span className="event-coverflow__title">{slide.title}</span>}
              <span className="event-coverflow__badge">Kegiatan ECC</span>
            </Link>
          )
        })}
      </div>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            className="event-coverflow__nav event-coverflow__nav--prev"
            aria-label="Kegiatan sebelumnya"
            onClick={goToPrev}
          >
            <FiChevronLeft />
          </button>
          <button
            type="button"
            className="event-coverflow__nav event-coverflow__nav--next"
            aria-label="Kegiatan berikutnya"
            onClick={goToNext}
          >
            <FiChevronRight />
          </button>

          <div className="event-coverflow__dots">
            {slides.map((slide, i) => (
              <button
                key={slide.src}
                type="button"
                className={i === index ? 'is-active' : ''}
                aria-label={`Tampilkan kegiatan ${i + 1}`}
                aria-current={i === index}
                onClick={() => goToSlide(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
