'use client'

import { useEffect, useState } from 'react'
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
import Page from '../../../components/layout/Page'
import PageHero from '../../../components/sections/PageHero'
import Reveal from '../../../components/ui/Reveal'
import SectionHeading from '../../../components/ui/SectionHeading'
import { site, waLink } from '../../../data/site'
import { api } from '../../../lib/api'
import { useSiteConfig } from '../../../hooks/useSiteConfig'

function ContactForm() {
  const [services, setServices] = useState([])
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    service_id: '',
    message: '',
  })

  useEffect(() => {
    api.services
      .list({ limit: 100 })
      .then(({ items }) => setServices(items))
      .catch(() => {})
  }, [])

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await api.contact.send({
        name: form.name,
        email: form.email,
        service_id: form.service_id || undefined,
        message: form.message,
      })
      setSent(true)
    } catch (err) {
      setError(err.message || 'Gagal mengirim pesan. Coba lagi.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="form-card">
      {sent ? (
        <div className="form__success">
          <FiCheckCircle />
          <span>
            Terima kasih, {form.name || 'Sahabat ECC-BTS'}! Pesan Anda telah kami
            terima. Tim kami akan segera menghubungi Anda.
          </span>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate>
          {error && <p className="auth-modal__error">{error}</p>}
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
            <label htmlFor="service_id">Layanan yang Diminati</label>
            <select
              id="service_id"
              name="service_id"
              value={form.service_id}
              onChange={update}
            >
              <option value="">Pilih layanan…</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
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
          <button type="submit" className="btn btn--primary btn--block btn--lg" disabled={busy}>
            <FiSend /> {busy ? 'Mengirim…' : 'Kirim Pesan'}
          </button>
          <p className="form__note">
            Untuk respons tercepat, silakan hubungi kami langsung via WhatsApp.
          </p>
        </form>
      )}
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
        {item.question}
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
            <p>{item.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Contact() {
  const [openFaq, setOpenFaq] = useState(0)
  const [faqs, setFaqs] = useState([])
  const config = useSiteConfig()

  useEffect(() => {
    api.faqs.list().then(setFaqs).catch(() => {})
  }, [])

  const phoneDisplay = config?.contact_phone || site.phoneDisplay
  const email = config?.contact_email || site.email
  const address = config?.address || site.address
  const waHref = config?.social_links?.whatsapp || waLink()
  // Diisi admin lewat panel; kalau kosong, kotak peta tetap jadi placeholder.
  const mapsUrl = config?.maps_embed_url

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
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-tile contact-tile--wa"
              >
                <span className="contact-tile__ic">
                  <FaWhatsapp />
                </span>
                <div>
                  <span>WhatsApp (tercepat)</span>
                  <b>{phoneDisplay}</b>
                </div>
              </a>
              <a href={`tel:${phoneDisplay}`} className="contact-tile">
                <span className="contact-tile__ic">
                  <FiPhone />
                </span>
                <div>
                  <span>Telepon</span>
                  <b>{phoneDisplay}</b>
                </div>
              </a>
              <a href={`mailto:${email}`} className="contact-tile">
                <span className="contact-tile__ic">
                  <FiMail />
                </span>
                <div>
                  <span>Email</span>
                  <b>{email}</b>
                </div>
              </a>
              <div className="contact-tile">
                <span className="contact-tile__ic">
                  <FiMapPin />
                </span>
                <div>
                  <span>Alamat</span>
                  <b>{address}</b>
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
                {mapsUrl ? (
                  <iframe
                    src={mapsUrl}
                    title={`Peta lokasi ${address}`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                ) : (
                  <div>
                    <FiMapPin />
                    <div>Peta lokasi (demo)</div>
                  </div>
                )}
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
                key={f.id}
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
