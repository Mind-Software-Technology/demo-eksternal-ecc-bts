'use client'

import { useEffect, useState } from 'react'
import { FiStar } from 'react-icons/fi'
import { FaQuoteLeft } from 'react-icons/fa6'
import { RevealGroup, RevealItem } from '../ui/Reveal'
import SectionHeading from '../ui/SectionHeading'
import { api } from '../../lib/api'

const initials = (name) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

/** Testimonials grid. */
export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([])

  useEffect(() => {
    api.testimonials.list().then(setTestimonials).catch(() => {})
  }, [])

  return (
    <section className="section section--dark">
      <span
        className="blob"
        aria-hidden="true"
        style={{ background: 'var(--blue-500)', width: 260, height: 260, top: -100, left: -70, opacity: 0.3 }}
      />
      <span
        className="blob"
        aria-hidden="true"
        style={{ background: 'var(--secondary)', width: 240, height: 240, bottom: -110, right: -60, opacity: 0.22 }}
      />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <SectionHeading
          eyebrow="Testimoni"
          title="Apa Kata Mereka"
          subtitle="Cerita dari mahasiswa, dosen, dan peneliti yang telah mempercayakan karyanya kepada kami."
          dark
        />
        <RevealGroup className="grid-testi">
          {testimonials.map((t) => (
            <RevealItem className="testi-card" key={t.id}>
              <FaQuoteLeft className="testi-card__quote" />
              <div className="testi-card__stars" aria-label={`${t.rating} dari 5`}>
                {Array.from({ length: Math.round(t.rating) }).map((_, i) => (
                  <FiStar key={i} fill="currentColor" />
                ))}
              </div>
              <p>“{t.text}”</p>
              <div className="testi-card__author">
                <span className="testi-card__avatar">{initials(t.name)}</span>
                <div>
                  <b>{t.name}</b>
                  <span>{t.role}</span>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
