import { Link } from 'react-router-dom'
import {
  FiPhone,
  FiMail,
  FiMapPin,
  FiClock,
} from 'react-icons/fi'
import { site, waLink } from '../../data/site'
import { services } from '../../data/services'
import { Icon } from '../../data/icons'
import BrandMark from './BrandMark'

export default function Footer() {
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
              {site.socials.map((s) => (
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
              {site.nav.map((n) => (
                <li key={n.to}>
                  <Link to={n.to}>{n.label}</Link>
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
                  <Link to="/produk">{s.title.replace('Jasa ', '')}</Link>
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
                <a href={waLink()} target="_blank" rel="noopener noreferrer">
                  {site.phoneDisplay}
                </a>
              </li>
              <li>
                <FiMail />
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </li>
              <li>
                <FiMapPin />
                <span>{site.address}</span>
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
        © {2026} {site.brand} — {site.brandFull}. Demo website. Seluruh hak cipta
        dilindungi.
      </div>
    </footer>
  )
}
