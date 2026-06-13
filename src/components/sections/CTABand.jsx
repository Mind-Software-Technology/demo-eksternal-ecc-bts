import { Link } from 'react-router-dom'
import { FaWhatsapp } from 'react-icons/fa6'
import { FiArrowRight } from 'react-icons/fi'
import Reveal from '../ui/Reveal'
import { waLink } from '../../data/site'

/** Closing call-to-action band. */
export default function CTABand({
  title = 'Siap Mewujudkan Karya Ilmiah Berkualitas?',
  text = 'Konsultasikan kebutuhan Anda sekarang — gratis dan tanpa kewajiban. Tim kami siap membantu.',
}) {
  return (
    <section className="section">
      <div className="container">
        <Reveal className="cta-band">
          <span className="blob b2" aria-hidden="true" style={{ background: '#f7941d', width: 260, height: 260, top: -90, right: -60 }} />
          <span className="blob" aria-hidden="true" style={{ background: '#1e6bd6', width: 220, height: 220, bottom: -90, left: -40, opacity: 0.5 }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2>{title}</h2>
            <p>{text}</p>
            <div className="cta-band__actions">
              <a
                href={waLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--wa btn--lg"
              >
                <FaWhatsapp /> Konsultasi via WhatsApp
              </a>
              <Link to="/kontak" className="btn btn--ghost btn--lg">
                Hubungi Kami <FiArrowRight />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
