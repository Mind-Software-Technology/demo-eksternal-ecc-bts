import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  FiPhone,
  FiMail,
  FiMapPin,
  FiClock,
  FiSend,
  FiCheckCircle,
  FiChevronDown,
} from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa6'
import Page from '../components/layout/Page'
import PageHero from '../components/sections/PageHero'
import Reveal from '../components/ui/Reveal'
import SectionHeading from '../components/ui/SectionHeading'
import { site, waLink } from '../data/site'
import { services } from '../data/services'
import { faqs } from '../data/faq'

function ContactForm() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    service: '',
    message: '',
  })

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = (e) => {
    e.preventDefault()
    // Demo only: no backend. Show a local success state.
    setSent(true)
  }

  return (
    <div className="form-card">
      {sent ? (
        <div className="form__success">
          <FiCheckCircle />
          <span>
            Terima kasih, {form.name || 'Sahabat ECC-BTS'}! Pesan Anda telah kami
            terima (demo). Tim kami akan segera menghubungi Anda.
          </span>
        </div>
      ) : null}

      <form onSubmit={onSubmit} noValidate>
        <div className="field--row">
          <div className="field">
            <label htmlFor="name">Nama Lengkap</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Nama Anda"
              value={form.name}
              onChange={update}
            />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="email@contoh.com"
              value={form.email}
              onChange={update}
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="service">Layanan yang Diminati</label>
          <select
            id="service"
            name="service"
            value={form.service}
            onChange={update}
          >
            <option value="">Pilih layanan…</option>
            {services.map((s) => (
              <option key={s.id} value={s.title}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="message">Pesan</label>
          <textarea
            id="message"
            name="message"
            required
            placeholder="Ceritakan kebutuhan karya ilmiah Anda…"
            value={form.message}
            onChange={update}
          />
        </div>
        <button type="submit" className="btn btn--blue btn--block btn--lg">
          <FiSend /> Kirim Pesan
        </button>
        <p className="form__note">
          *Ini adalah formulir demo — pesan tidak benar-benar terkirim. Untuk
          respons cepat, silakan hubungi kami via WhatsApp.
        </p>
      </form>
    </div>
  )
}

function FaqItem({ item, open, onToggle }) {
  return (
    <div className={`faq-item ${open ? 'open' : ''}`}>
      <button
        type="button"
        className="faq-item__q"
        aria-expanded={open}
        onClick={onToggle}
      >
        {item.q}
        <FiChevronDown />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="faq-item__a"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <p>{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Contact() {
  const [openFaq, setOpenFaq] = useState(0)

  return (
    <Page title="Kontak — ECC-BTS">
      <PageHero
        title="Hubungi Kami"
        crumb="Kontak"
        subtitle="Punya pertanyaan atau ingin memesan layanan? Tim kami siap membantu Anda."
      />

      <section className="section">
        <div className="container contact-grid">
          <Reveal>
            <SectionHeading
              center={false}
              eyebrow="Kirim Pesan"
              title="Mari Diskusikan Kebutuhan Anda"
              subtitle="Isi formulir berikut, atau hubungi kami langsung melalui kanal di samping."
            />
            <div style={{ marginTop: '1.6rem' }}>
              <ContactForm />
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="contact-tiles">
              <a
                href={waLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-tile contact-tile--wa"
              >
                <span className="contact-tile__ic">
                  <FaWhatsapp />
                </span>
                <div>
                  <span>WhatsApp (tercepat)</span>
                  <b>{site.phoneDisplay}</b>
                </div>
              </a>
              <a href={`tel:+${site.whatsapp}`} className="contact-tile">
                <span className="contact-tile__ic">
                  <FiPhone />
                </span>
                <div>
                  <span>Telepon</span>
                  <b>{site.phoneDisplay}</b>
                </div>
              </a>
              <a href={`mailto:${site.email}`} className="contact-tile">
                <span className="contact-tile__ic">
                  <FiMail />
                </span>
                <div>
                  <span>Email</span>
                  <b>{site.email}</b>
                </div>
              </a>
              <div className="contact-tile">
                <span className="contact-tile__ic">
                  <FiMapPin />
                </span>
                <div>
                  <span>Alamat</span>
                  <b>{site.address}</b>
                </div>
              </div>
              <div className="contact-tile">
                <span className="contact-tile__ic">
                  <FiClock />
                </span>
                <div>
                  <span>Jam Operasional</span>
                  <b>{site.hours}</b>
                </div>
              </div>

              <div className="map-embed">
                <div>
                  <FiMapPin />
                  <div>Peta lokasi (demo)</div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="section section--soft">
        <div className="container">
          <SectionHeading
            eyebrow="FAQ"
            title="Pertanyaan yang Sering Diajukan"
            subtitle="Belum menemukan jawaban? Hubungi kami langsung via WhatsApp."
          />
          <div className="faq">
            {faqs.map((f, i) => (
              <FaqItem
                key={f.q}
                item={f}
                open={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? -1 : i)}
              />
            ))}
          </div>
        </div>
      </section>
    </Page>
  )
}
