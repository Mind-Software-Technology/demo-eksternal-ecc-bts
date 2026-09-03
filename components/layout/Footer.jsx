'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FiPhone,
  FiMail,
  FiMapPin,
  FiClock,
} from 'react-icons/fi'
import { site, waLink, getNavItems } from '../../data/site'
import { Icon } from '../../data/icons'
import { api } from '../../lib/api'
import { useSiteConfig } from '../../hooks/useSiteConfig'
import BrandMark from './BrandMark'

const SOCIAL_ICON = {
  instagram: 'FaInstagram',
  facebook: 'FaFacebookF',
  tiktok: 'FaTiktok',
  youtube: 'FaYoutube',
  whatsapp: 'FaWhatsapp',
}

export default function Footer() {
  const config = useSiteConfig()
  const [services, setServices] = useState([])

  useEffect(() => {
    api.services
      .list({ limit: 6 })
      .then(({ items }) => setServices(items))
      .catch(() => {})
  }, [])

  const navItems = getNavItems(config)
  const socials = config?.social_links
    ? Object.entries(config.social_links).map(([name, url]) => ({
        name,
        url,
        icon: SOCIAL_ICON[name],
      }))
    : site.socials.map((s) => ({ name: s.name, url: s.url, icon: s.icon }))

  const phoneDisplay = config?.contact_phone || site.phoneDisplay
  const email = config?.contact_email || site.email
  const address = config?.address || site.address
  const waHref = config?.social_links?.whatsapp || waLink()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          {/* About */}
          <div className="footer__about">
            <BrandMark />
            <p>{site.description}</p>
            <div className="footer__motto">
              {site.motto.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
            <div className="footer__socials">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  aria-label={s.name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name={s.icon} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4>Navigasi</h4>
            <ul className="footer__links">
              {navItems.map((n) => (
                <li key={n.to}>
                  <Link href={n.to}>{n.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4>Layanan</h4>
            <ul className="footer__links">
              {services.map((s) => (
                <li key={s.id}>
                  <Link href={`/produk/${s.slug}`}>{s.title.replace('Jasa ', '')}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4>Kontak</h4>
            <ul className="footer__contact">
              <li>
                <FiPhone />
                <a href={waHref} target="_blank" rel="noopener noreferrer">
                  {phoneDisplay}
                </a>
              </li>
              <li>
                <FiMail />
                <a href={`mailto:${email}`}>{email}</a>
              </li>
              <li>
                <FiMapPin />
                <span>{address}</span>
              </li>
              <li>
                <FiClock />
                <span>{site.hours}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        © {new Date().getFullYear()} {config?.brand_name || site.brand} — {site.brandFull}.
        Seluruh hak cipta dilindungi.
      </div>
    </footer>
  )
}
