'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { FiArrowRight, FiCheck } from 'react-icons/fi'
import ServiceNameCard from '../ui/ServiceNameCard'
import { useServices } from '../../hooks/useServices'

const ROTATE_MS = 6000

/** Full-width intro copy on top, then a row with the detail panel on the
 * left and a grid of compact, clickable service thumbnails on the right.
 * The thumbnails are pure navigation — clicking one fades the left panel
 * to that service's detail; the active thumbnail gets a distinct border.
 * Left alone, the active service also advances on its own, same as the
 * testimonials carousel. */
export default function ServicesGrid({
  eyebrow = 'Layanan Kami',
  title = 'Layanan Unggulan ECC-BTS',
  subtitle = 'Layanan untuk mendukung setiap tahap karya ilmiah Anda — dari penulisan hingga publikasi.',
}) {
  const { items: services } = useServices({ limit: 6 })
  const [activeIndex, setActiveIndex] = useState(0)
  const reduce = useReducedMotion()

  const total = services.length

  // Timer di-pasang ulang tiap kali activeIndex berubah, jadi mengklik kartu
  // sekaligus me-reset hitungannya — panel tidak melompat sedetik setelah
  // pengunjung memilih sendiri.
  useEffect(() => {
    if (reduce || total < 2) return
    const id = setTimeout(() => setActiveIndex((i) => (i + 1) % total), ROTATE_MS)
    return () => clearTimeout(id)
  }, [activeIndex, total, reduce])

  const active = services[activeIndex] ?? services[0]

  return (
    <section className="section section--dark layanan-section">
      <span
        className="blob"
        aria-hidden="true"
        style={{ background: 'var(--secondary)', width: 280, height: 280, top: -110, right: -70, opacity: 0.25 }}
      />
      <span
        className="blob"
        aria-hidden="true"
        style={{ background: 'var(--blue-500)', width: 240, height: 240, bottom: -120, left: -60, opacity: 0.3 }}
      />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          className="layanan-section__copy"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="eyebrow">{eyebrow}</span>
          <h2 className="layanan-section__title">{title}</h2>
          <p className="lead" style={{ color: 'var(--ondark-body)' }}>
            {subtitle}
          </p>
          <Link href="/produk" className="layanan-split__cta">
            Lihat Semua Layanan <FiArrowRight />
          </Link>
        </motion.div>

        <div className="layanan-split">
          {/* The panel itself always stays mounted (it's what gives the flex
             row its stretch height, matched against the thumb grid) — only
             the content inside cross-fades, so switching services never
             collapses/re-expands the row. */}
          <div className="layanan-detail">
            <AnimatePresence mode="wait">
              {active && (
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <h3>{active.title}</h3>
                  <p className="layanan-detail__tag">{active.tagline}</p>
                  <ul className="layanan-detail__points">
                    {(active.points || []).map((p) => (
                      <li key={p}>
                        <FiCheck /> {p}
                      </li>
                    ))}
                  </ul>
                  <Link href={`/produk/${active.slug}`} className="layanan-detail__link">
                    Selengkapnya <FiArrowRight />
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="layanan-thumb-grid">
            {services.map((s, i) => (
              <ServiceNameCard
                key={s.id}
                service={s}
                index={i}
                active={i === activeIndex}
                onClick={() => setActiveIndex(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
