import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiSearch, FiCheckCircle, FiStar } from 'react-icons/fi'
import { categories } from '../../data/categories'

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function Hero() {
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  const onSearch = (e) => {
    e.preventDefault()
    const term = q.trim()
    navigate(term ? `/produk?q=${encodeURIComponent(term)}` : '/produk')
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
            ECC-BTS • Pusat Kolaborasi Pendidikan
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
            <button type="submit" className="btn btn--blue">
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
              <Link key={c.id} to={`/produk?cat=${c.id}`} className="hero__chip">
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
            <img
              src="/images/publikasi-artikel-ilmiah.jpg"
              alt="Naskah karya ilmiah yang sedang dikerjakan tim ECC-BTS"
            />
          </div>

          <div className="hero__media-badge hero__media-badge--rating">
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
          </div>

          <div className="hero__media-badge hero__media-badge--quality">
            <FiCheckCircle />
            <span>
              100%
              <small>Komitmen Kualitas</small>
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
