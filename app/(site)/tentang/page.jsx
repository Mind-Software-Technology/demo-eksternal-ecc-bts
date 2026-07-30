'use client'

import { useEffect, useState } from 'react'
import { FiTarget, FiHeart, FiAward, FiShield, FiZap } from 'react-icons/fi'
import Page from '../../../components/layout/Page'
import PageHero from '../../../components/sections/PageHero'
import WhyChooseUs from '../../../components/sections/WhyChooseUs'
import CTABand from '../../../components/sections/CTABand'
import Reveal from '../../../components/ui/Reveal'
import SectionHeading from '../../../components/ui/SectionHeading'
import { site } from '../../../data/site'
import { api } from '../../../lib/api'

const values = [
  {
    icon: FiAward,
    title: 'Profesional',
    desc: 'Setiap pekerjaan ditangani sesuai standar dan etika akademik.',
  },
  {
    icon: FiZap,
    title: 'Cepat & Tepat',
    desc: 'Mengutamakan ketepatan waktu tanpa mengorbankan kualitas.',
  },
  {
    icon: FiShield,
    title: 'Terpercaya',
    desc: 'Kerahasiaan dan kepuasan klien adalah prioritas utama kami.',
  },
]

export default function About() {
  const [aboutStats, setAboutStats] = useState(null)

  useEffect(() => {
    api.aboutStats.show().then(setAboutStats).catch(() => {})
  }, [])

  return (
    <Page title="Tentang Kami — ECC-BTS">
      <PageHero
        title="Tentang ECC-BTS"
        crumb="Tentang Kami"
        subtitle="Pusat Kolaborasi Pendidikan yang berkomitmen membantu Anda menghasilkan karya ilmiah berkualitas."
      />

      {/* Story */}
      <section className="section">
        <div className="container about-story">
          <Reveal>
            <span className="eyebrow">Siapa Kami</span>
            <h2 style={{ marginTop: '0.9rem' }}>
              Mitra Tepercaya untuk{' '}
              <span className="text-blue-grad">Karya Ilmiah Anda</span>
            </h2>
            <p style={{ marginTop: '1rem' }}>
              ECC-BTS (Education Collaboration Center) hadir sebagai pusat
              kolaborasi pendidikan yang mendampingi mahasiswa, dosen, dan
              peneliti dalam menghasilkan karya ilmiah yang berkualitas,
              kredibel, dan tepat waktu.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              Dengan tim ahli berpengalaman di bidang penyuntingan, analisis data,
              dan publikasi, kami berkomitmen memberikan layanan terbaik —
              berlandaskan semangat <strong>Bersinergi, Berbagi, Berprestasi</strong>.
            </p>
            <div className="footer__motto" style={{ marginTop: '1.2rem' }}>
              {site.motto.map((m) => (
                <span
                  key={m}
                  style={{
                    background: 'var(--soft-2)',
                    color: 'var(--blue-700)',
                  }}
                >
                  {m}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="about-visual">
              <span
                className="blob"
                aria-hidden="true"
                style={{ background: 'var(--secondary)', width: 220, height: 220, top: -80, right: -50, opacity: 0.5 }}
              />
              <div className="about-visual__stats">
                <div className="about-visual__stat">
                  <b>{aboutStats ? `${aboutStats.karya_ilmiah_selesai}+` : '—'}</b>
                  <span>Karya Ilmiah Selesai</span>
                </div>
                <div className="about-visual__stat">
                  <b>{aboutStats ? `${aboutStats.klien_puas}+` : '—'}</b>
                  <span>Klien Puas</span>
                </div>
                <div className="about-visual__stat">
                  <b>{aboutStats ? `${aboutStats.publikasi_jurnal}+` : '—'}</b>
                  <span>Publikasi Jurnal</span>
                </div>
                <div className="about-visual__stat">
                  <b>{aboutStats ? `${aboutStats.komitmen_kualitas}%` : '—'}</b>
                  <span>Komitmen Kualitas</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section section--dark">
        <span
          className="blob"
          aria-hidden="true"
          style={{ background: 'var(--secondary)', width: 260, height: 260, top: -100, right: -60, opacity: 0.22 }}
        />
        <span
          className="blob"
          aria-hidden="true"
          style={{ background: 'var(--blue-500)', width: 240, height: 240, bottom: -110, left: -60, opacity: 0.3 }}
        />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <SectionHeading
            eyebrow="Visi & Misi"
            title="Arah dan Tujuan Kami"
            dark
          />
          <div className="mv-grid">
            <Reveal className="mv-card mv-card--vision">
              <div className="mv-card__ic">
                <FiTarget />
              </div>
              <h3>Visi</h3>
              <p style={{ marginTop: '0.6rem' }}>
                Menjadi pusat kolaborasi pendidikan yang unggul, profesional,
                dan terpercaya dalam pengembangan kompetensi, pengolahan data,
                publikasi ilmiah, serta penerbitan karya akademik untuk
                mendukung kemajuan pendidikan dan penelitian.
              </p>
            </Reveal>
            <Reveal className="mv-card" delay={0.12}>
              <div className="mv-card__ic">
                <FiHeart />
              </div>
              <h3>Misi</h3>
              <ol className="mv-card__list">
                <li>
                  Menyelenggarakan layanan pengembangan kompetensi yang
                  berkualitas dan berkelanjutan.
                </li>
                <li>
                  Menyediakan layanan pengolahan data dan publikasi ilmiah
                  yang profesional dan terpercaya.
                </li>
                <li>
                  Mendukung peningkatan kualitas karya akademik melalui
                  layanan penyuntingan, proofreading dan pemeriksaan naskah.
                </li>
                <li>
                  Memfasilitasi penerbitan buku dan karya ilmiah yang
                  bermanfaat bagi pengembangan ilmu pengetahuan.
                </li>
                <li>
                  Membangun kolaborasi yang produktif untuk kemajuan
                  pendidikan, penelitian dan literasi.
                </li>
              </ol>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Nilai Kami"
            title="Profesional • Cepat • Terpercaya"
          />
          <div className="values-grid">
            {values.map((v, i) => (
              <Reveal className="value-item" key={v.title} delay={i * 0.1}>
                <v.icon />
                <div>
                  <h3>{v.title}</h3>
                  <p>{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <WhyChooseUs />
      <CTABand />
    </Page>
  )
}
