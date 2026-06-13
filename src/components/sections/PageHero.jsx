import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiChevronRight } from 'react-icons/fi'

/** Compact dark banner shown at the top of sub-pages. */
export default function PageHero({ title, subtitle, crumb }) {
  return (
    <section className="page-hero">
      <div className="hero__bg" aria-hidden="true">
        <span className="blob b1" style={{ animation: 'float-y 9s ease-in-out infinite' }} />
        <span className="blob b2" style={{ animation: 'float-y 9s ease-in-out infinite 1.5s' }} />
      </div>
      <div className="hero__grid-overlay" aria-hidden="true" />
      <div className="container page-hero__inner">
        <motion.nav
          className="crumbs"
          aria-label="Breadcrumb"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link to="/">Beranda</Link>
          <FiChevronRight />
          <span>{crumb || title}</span>
        </motion.nav>
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </section>
  )
}
