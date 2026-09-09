'use client'

import { useEffect, useState } from 'react'
import { FiChevronLeft, FiChevronRight, FiStar } from 'react-icons/fi'
import { FaQuoteLeft } from 'react-icons/fa6'
import { motion, useReducedMotion } from 'framer-motion'
import SectionHeading from '../ui/SectionHeading'
import { useTestimonials } from '../../hooks/useTestimonials'

const ROTATE_MS = 6000

const initials = (name) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

/** Avatar: a real client photo when the API provides one, else the same
 * initials badge as before. */
function Avatar({ t }) {
  return t.photo_url ? (
    <img className="testi-card__avatar" src={t.photo_url} alt={t.name} />
  ) : (
    <span className="testi-card__avatar">{initials(t.name)}</span>
  )
}

/** Testimonials: satu kartu tampil bergantian, dengan tombol maju/mundur. */
export default function Testimonials() {
  const testimonials = useTestimonials()
  const [index, setIndex] = useState(0)
  // +1/-1 — which way the last navigation went, so the card can slide in
  // from the matching side instead of always drifting the same direction.
  const [direction, setDirection] = useState(1)
  const reduce = useReducedMotion()

  const advance = (dir) => {
    setDirection(dir)
    setIndex((i) => i + dir)
  }

  // Timer di-pasang ulang tiap kali index berubah, jadi menekan tombol
  // sekaligus me-reset hitungannya — kartu tidak melompat sedetik setelah
  // pengunjung memilih sendiri.
  useEffect(() => {
    if (reduce || testimonials.length < 2) return
    const id = setTimeout(() => advance(1), ROTATE_MS)
    return () => clearTimeout(id)
  }, [index, testimonials.length, reduce])

  if (!testimonials.length) return null

  const total = testimonials.length
  // index dibiarkan naik terus dan dibungkus di sini, jadi maju dari kartu
  // terakhir kembali ke awal tanpa perlu pengecekan di dua tempat.
  const position = ((index % total) + total) % total
  const t = testimonials[position]
  // Kartu berikutnya, diintip sedikit di belakang kartu utama — sekadar
  // dekorasi (aria-hidden), bukan konten yang bisa dibaca.
  const peek = total > 1 ? testimonials[(position + 1) % total] : null

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
      <span
        className="blob"
        aria-hidden="true"
        style={{ background: 'var(--blue-400)', width: 200, height: 200, top: '30%', right: '18%', opacity: 0.16 }}
      />
      <div className="container testi-wrap">
        <div>
          <SectionHeading
            eyebrow="Testimoni"
            title="Apa Kata Mereka"
            subtitle="Cerita dari mahasiswa, dosen, dan peneliti yang telah mempercayakan karyanya kepada kami."
            center={false}
            dark
          />
          <div className="testi-nav">
            <button type="button" onClick={() => advance(-1)} aria-label="Testimoni sebelumnya">
              <FiChevronLeft />
            </button>
            <span aria-live="polite">
              {position + 1} / {total}
            </span>
            <button type="button" onClick={() => advance(1)} aria-label="Testimoni berikutnya">
              <FiChevronRight />
            </button>
          </div>
        </div>

        <div className="testi-stack">
          {peek && (
            <div className="testi-card testi-card--peek" aria-hidden="true">
              <FaQuoteLeft className="testi-card__quote" />
              <p>“{peek.text}”</p>
              <div className="testi-card__author">
                <Avatar t={peek} />
                <div>
                  <b>{peek.name}</b>
                  <span>{peek.role}</span>
                </div>
              </div>
            </div>
          )}

          <motion.div
            className="testi-card"
            key={t.id}
            initial={reduce ? false : { opacity: 0, x: direction * 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <FaQuoteLeft className="testi-card__quote" />
            <div className="testi-card__stars" aria-label={`${t.rating} dari 5`}>
              {Array.from({ length: Math.round(t.rating) }).map((_, i) => (
                <FiStar key={i} fill="currentColor" />
              ))}
            </div>
            <p>“{t.text}”</p>
            <div className="testi-card__author">
              <Avatar t={t} />
              <div>
                <b>{t.name}</b>
                <span>{t.role}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
