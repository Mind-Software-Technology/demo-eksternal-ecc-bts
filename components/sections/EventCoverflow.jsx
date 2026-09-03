'use client'

import Link from 'next/link'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

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

/**
 * 3D coverflow: satu gambar tengah besar & jelas, gambar di kiri-kanannya
 * mengecil dan meredup mengikuti jaraknya dari tengah (efek depth), sedikit
 * terpotong di tepi panel gelap. `slides[i]` butuh { src, alt, title }.
 */
export default function EventCoverflow({ slides, index, onPrev, onNext, onSelect }) {
  const activeTitle = slides[index]?.title

  return (
    <div className="event-coverflow">
      {activeTitle && <div className="event-coverflow__label">{activeTitle}</div>}

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
              <span className="event-coverflow__badge">
                <img src="/images/logo.png" alt="" aria-hidden="true" />
                Kegiatan ECC
              </span>
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
            onClick={onPrev}
          >
            <FiChevronLeft />
          </button>
          <button
            type="button"
            className="event-coverflow__nav event-coverflow__nav--next"
            aria-label="Kegiatan berikutnya"
            onClick={onNext}
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
                onClick={() => onSelect(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
