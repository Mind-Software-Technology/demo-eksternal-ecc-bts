'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiCheckCircle, FiCalendar, FiStar, FiClock, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { formatEventShortDate } from '../../data/format'
import { api } from '../../lib/api'

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
}

const FALLBACK_SLIDE = {
  src: '/images/publikasi-artikel-ilmiah.jpg',
  alt: 'Naskah karya ilmiah yang sedang dikerjakan tim ECC',
}
const SLIDE_INTERVAL_MS = 4500

export default function Hero() {
  const [q, setQ] = useState('')
  const [categories, setCategories] = useState([])
  const [eventSlides, setEventSlides] = useState([])
  const [slideIndex, setSlideIndex] = useState(0)
  const router = useRouter()

  useEffect(() => {
    api.categories.list().then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    api.events
      .list()
      .then((items) => {
        const withFlyer = items
          .filter((e) => e.flyer_url)
          .map((e) => ({
            src: e.flyer_url,
            alt: e.title,
            title: e.title,
            startsAt: e.starts_at,
            endsAt: e.ends_at,
          }))
        setEventSlides(withFlyer)
      })
      .catch(() => {})
  }, [])

  const slides = eventSlides.length > 0 ? eventSlides : [FALLBACK_SLIDE]

  // Auto-advance stays on; restarting the timer on `slideIndex` means a manual
  // pick (below) also gets a full interval before the next auto-advance,
  // instead of being cut short by whatever was already in flight.
  useEffect(() => {
    if (slides.length < 2) return undefined
    const id = setInterval(() => {
      setSlideIndex((i) => (i + 1) % slides.length)
    }, SLIDE_INTERVAL_MS)
    return () => clearInterval(id)
  }, [slides.length, slideIndex])

  const goToSlide = (i) => setSlideIndex(((i % slides.length) + slides.length) % slides.length)
  const goToPrevSlide = () => goToSlide(slideIndex - 1)
  const goToNextSlide = () => goToSlide(slideIndex + 1)

  const activeSlide = slides[slideIndex % slides.length]
  const isEventSlide = eventSlides.length > 0
  const hasEventDates = isEventSlide && Boolean(activeSlide.startsAt)
  const sameDay =
    hasEventDates &&
    activeSlide.endsAt &&
    new Date(activeSlide.startsAt).toDateString() === new Date(activeSlide.endsAt).toDateString()
  const eventEndLabel =
    hasEventDates && activeSlide.endsAt && !sameDay
      ? `s.d. ${formatEventShortDate(activeSlide.endsAt)}`
      : 'Jadwal Kegiatan'

  const onSearch = (e) => {
    e.preventDefault()
    const term = q.trim()
    router.push(term ? `/produk?q=${encodeURIComponent(term)}` : '/produk')
  }

  return (
    <section className="hero">
      <div className="hero__bg" aria-hidden="true">
        <span className="blob b1" />
        <span className="blob b2" />
      </div>

      <div className="container hero__inner">
        {/* Copy */}
        <div className="hero__copy">
          <motion.span
            className="eyebrow"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            ECC • Best To Solution
          </motion.span>

          <motion.h1
            className="hero__title"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
          >
            Temukan Layanan untuk{' '}
            <span className="text-grad">Karya Ilmiah Anda</span>
          </motion.h1>

          <motion.p
            className="hero__sub"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
          >
            Dari cek similarity, olah data, hingga publikasi dan penerbitan buku —
            semua layanan dalam satu tempat, dikerjakan tim ahli yang profesional
            dan terpercaya.
          </motion.p>

          <motion.form
            className="hero__search"
            onSubmit={onSearch}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
          >
            <FiSearch className="hero__search-ic" aria-hidden="true" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari layanan… mis. Turnitin, publikasi, statistik"
              aria-label="Cari layanan"
            />
            <button type="submit" className="btn btn--primary">
              Cari
            </button>
          </motion.form>

          <motion.div
            className="hero__chips"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={4}
          >
            <span className="hero__chips-label">Populer:</span>
            {categories.map((c) => (
              <Link key={c.slug} href={`/produk?cat=${c.slug}`} className="hero__chip">
                {c.title}
              </Link>
            ))}
          </motion.div>

          <motion.div
            className="hero__trust"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={5}
          >
            <div>
              <b>1.500+</b>
              <span>Karya selesai</span>
            </div>
            <div>
              <b>800+</b>
              <span>Klien puas</span>
            </div>
            <div>
              <b>100%</b>
              <span>Komitmen kualitas</span>
            </div>
          </motion.div>
        </div>

        {/* Visual */}
        <motion.div
          className="hero__visual"
          initial={{ opacity: 0, scale: 0.94, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="hero__media">
            <Link href="/kegiatan" className="hero__media-link" aria-label="Lihat kegiatan ECC">
              <AnimatePresence>
                <motion.img
                  key={activeSlide.src}
                  src={activeSlide.src}
                  alt={activeSlide.alt || 'Kegiatan ECC'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: 'easeInOut' }}
                />
              </AnimatePresence>
            </Link>

            {slides.length > 1 && (
              <>
                <button
                  type="button"
                  className="hero__media-nav hero__media-nav--prev"
                  aria-label="Gambar sebelumnya"
                  onClick={goToPrevSlide}
                >
                  <FiChevronLeft />
                </button>
                <button
                  type="button"
                  className="hero__media-nav hero__media-nav--next"
                  aria-label="Gambar berikutnya"
                  onClick={goToNextSlide}
                >
                  <FiChevronRight />
                </button>

                <span className="hero__media-dots">
                  {slides.map((s, i) => (
                    <button
                      key={s.src}
                      type="button"
                      className={i === slideIndex ? 'is-active' : ''}
                      aria-label={`Tampilkan gambar ${i + 1}`}
                      aria-current={i === slideIndex}
                      onClick={() => goToSlide(i)}
                    />
                  ))}
                </span>
              </>
            )}
          </div>

          <div className="hero__media-badge hero__media-badge--rating">
            {isEventSlide ? (
              <>
                <FiCalendar />
                <span>
                  {activeSlide.title}
                  <small>Kegiatan ECC</small>
                </span>
              </>
            ) : (
              <>
                <span className="hero__rating-stars" aria-hidden="true">
                  <FiStar />
                  <FiStar />
                  <FiStar />
                  <FiStar />
                  <FiStar />
                </span>
                <span>
                  4,9 / 5
                  <small>Rating klien</small>
                </span>
              </>
            )}
          </div>

          <div className={`hero__media-badge hero__media-badge--quality ${hasEventDates ? 'is-event' : ''}`}>
            {hasEventDates ? (
              <>
                <FiClock />
                <span>
                  {formatEventShortDate(activeSlide.startsAt)}
                  <small>{eventEndLabel}</small>
                </span>
              </>
            ) : (
              <>
                <FiCheckCircle />
                <span>
                  100%
                  <small>Komitmen Kualitas</small>
                </span>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
