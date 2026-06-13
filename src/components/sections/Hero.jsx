import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiCheckCircle, FiArrowRight } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa6'
import { site, waLink } from '../../data/site'
import { services } from '../../data/services'
import { Icon } from '../../data/icons'

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function Hero() {
  const featured = services.slice(0, 3)

  return (
    <section className="hero">
      <div className="hero__bg" aria-hidden="true">
        <span className="blob b1" />
        <span className="blob b2" />
        <span className="blob b3" />
      </div>
      <div className="hero__grid-overlay" aria-hidden="true" />

      <div className="container hero__inner">
        {/* Copy */}
        <div>
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
            Solusi Tepat untuk{' '}
            <span className="text-grad">Karya Ilmiah Berkualitas</span>
          </motion.h1>

          <motion.p
            className="hero__sub"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
          >
            Dari cek similarity, olah data, hingga publikasi dan penerbitan buku —
            kami dampingi karya ilmiah Anda dengan profesional, cepat, dan
            terpercaya.
          </motion.p>

          <motion.div
            className="hero__values"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
          >
            {site.valueWords.map((w) => (
              <span className="hero__value" key={w}>
                <FiCheckCircle /> {w}
              </span>
            ))}
          </motion.div>

          <motion.div
            className="hero__actions"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={4}
          >
            <a
              href={waLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--wa btn--lg"
            >
              <FaWhatsapp /> Konsultasi Gratis
            </a>
            <Link to="/produk" className="btn btn--ghost btn--lg">
              Lihat Layanan <FiArrowRight />
            </Link>
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
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="hero-card">
            <div className="hero-badge">
              <FiCheckCircle />
              <span>
                100%
                <small>Komitmen Kualitas</small>
              </span>
            </div>
            {featured.map((s) => (
              <div className="hero-card__row" key={s.id} data-accent={s.accent}>
                <span className="hero-card__ic">
                  <Icon name={s.icon} />
                </span>
                <div>
                  <b>{s.title.replace('Jasa ', '')}</b>
                  <p>{s.tagline}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
