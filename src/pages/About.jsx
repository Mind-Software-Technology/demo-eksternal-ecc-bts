import { FiTarget, FiHeart, FiAward, FiShield, FiZap } from 'react-icons/fi'
import Page from '../components/layout/Page'
import PageHero from '../components/sections/PageHero'
import WhyChooseUs from '../components/sections/WhyChooseUs'
import CTABand from '../components/sections/CTABand'
import Reveal from '../components/ui/Reveal'
import SectionHeading from '../components/ui/SectionHeading'
import { site } from '../data/site'

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
                style={{ background: '#f7941d', width: 220, height: 220, top: -80, right: -50, opacity: 0.5 }}
              />
              <div className="about-visual__stats">
                <div className="about-visual__stat">
                  <b>1.500+</b>
                  <span>Karya Ilmiah Selesai</span>
                </div>
                <div className="about-visual__stat">
                  <b>800+</b>
                  <span>Klien Puas</span>
                </div>
                <div className="about-visual__stat">
                  <b>350+</b>
                  <span>Publikasi Jurnal</span>
                </div>
                <div className="about-visual__stat">
                  <b>100%</b>
                  <span>Komitmen Kualitas</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section section--soft">
        <div className="container">
          <SectionHeading
            eyebrow="Visi & Misi"
            title="Arah dan Tujuan Kami"
          />
          <div className="mv-grid">
            <Reveal className="mv-card mv-card--vision">
              <div className="mv-card__ic">
                <FiTarget />
              </div>
              <h3>Visi</h3>
              <p style={{ marginTop: '0.6rem' }}>
                Menjadi pusat kolaborasi pendidikan terdepan yang mendukung
                lahirnya karya ilmiah berkualitas dan berdampak luas.
              </p>
            </Reveal>
            <Reveal className="mv-card" delay={0.12}>
              <div className="mv-card__ic">
                <FiHeart />
              </div>
              <h3>Misi</h3>
              <p style={{ marginTop: '0.6rem' }}>
                Memberikan layanan profesional, cepat, dan terpercaya; menjaga
                integritas akademik; serta mendampingi setiap klien hingga
                karyanya berhasil diselesaikan dan dipublikasikan.
              </p>
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
