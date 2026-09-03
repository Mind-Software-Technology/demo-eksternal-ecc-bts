'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FiSearch } from 'react-icons/fi'
import { formatCount } from '../../data/format'
import { api } from '../../lib/api'
import { useSiteConfig } from '../../hooks/useSiteConfig'
import { useCategories } from '../../hooks/useCategories'
import { getHero } from '../../data/site'
import EventCoverflow from './EventCoverflow'

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
  const categories = useCategories()
  const [eventSlides, setEventSlides] = useState([])
  const [slideIndex, setSlideIndex] = useState(0)
  const router = useRouter()
  const config = useSiteConfig()

  const hero = getHero(config)

  // Belum termuat -> tampilkan "—", bukan 0. Angka nol sekejap lalu melompat
  // ke angka asli terbaca seperti datanya salah.
  const stats = config?.stats

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

      <div className="container">
        <div className="hero__inner">
        {/* Copy */}
        <div className="hero__copy">
          <motion.span
            className="eyebrow"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            {hero.eyebrow}
          </motion.span>

          <motion.h1
            className="hero__title"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
          >
            {hero.title}{' '}
            <span className="text-grad">{hero.title_highlight}</span>
          </motion.h1>

          <motion.p
            className="hero__sub"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
          >
            {hero.subtitle}
          </motion.p>

          <motion.div
            className="hero__chips"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
          >
            <span className="hero__chips-label">Populer:</span>
            {categories.map((c) => (
              <Link key={c.slug} href={`/produk?cat=${c.slug}`} className="hero__chip">
                {c.title}
              </Link>
            ))}
          </motion.div>

          <motion.form
            className="hero__search hero__search--wide"
            onSubmit={onSearch}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={4}
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
            className="hero__trust"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={5}
          >
            <div>
              <b>{stats ? formatCount(stats.works_done) : '—'}</b>
              <span>{hero.stat_works_label}</span>
            </div>
            <div>
              <b>{stats ? formatCount(stats.happy_clients) : '—'}</b>
              <span>{hero.stat_clients_label}</span>
            </div>
            <div>
              <b>{hero.stat_quality_value}</b>
              <span>{hero.stat_quality_label}</span>
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
          <EventCoverflow
            slides={slides}
            index={slideIndex}
            onPrev={goToPrevSlide}
            onNext={goToNextSlide}
            onSelect={goToSlide}
          />
        </motion.div>
        </div>
      </div>
    </section>
  )
}
