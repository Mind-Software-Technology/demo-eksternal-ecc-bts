'use client'

import { useEffect, useState } from 'react'
import { FiChevronLeft, FiChevronRight, FiStar } from 'react-icons/fi'
import { FaQuoteLeft } from 'react-icons/fa6'
import { motion, useReducedMotion } from 'framer-motion'
import SectionHeading from '../ui/SectionHeading'
import { api } from '../../lib/api'

const ROTATE_MS = 6000

const initials = (name) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

/** Testimonials: satu kartu tampil bergantian, dengan tombol maju/mundur. */
export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([])
  const [index, setIndex] = useState(0)
  const reduce = useReducedMotion()

  useEffect(() => {
    api.testimonials.list().then(setTestimonials).catch(() => {})
  }, [])

  // Timer di-pasang ulang tiap kali index berubah, jadi menekan tombol
  // sekaligus me-reset hitungannya — kartu tidak melompat sedetik setelah
  // pengunjung memilih sendiri.
  useEffect(() => {
    if (reduce || testimonials.length < 2) return
    const id = setTimeout(() => setIndex((i) => i + 1), ROTATE_MS)
    return () => clearTimeout(id)
  }, [index, testimonials.length, reduce])

  if (!testimonials.length) return null

  const total = testimonials.length
  // index dibiarkan naik terus dan dibungkus di sini, jadi maju dari kartu
  // terakhir kembali ke awal tanpa perlu pengecekan di dua tempat.
  const position = ((index % total) + total) % total
  const t = testimonials[position]

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
            <button type="button" onClick={() => setIndex((i) => i - 1)} aria-label="Testimoni sebelumnya">
              <FiChevronLeft />
            </button>
            <span aria-live="polite">
              {position + 1} / {total}
            </span>
            <button type="button" onClick={() => setIndex((i) => i + 1)} aria-label="Testimoni berikutnya">
              <FiChevronRight />
            </button>
          </div>
        </div>

        <motion.div
          className="testi-card"
          key={t.id}
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
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
        </motion.div>
      </div>
    </section>
  )
}
