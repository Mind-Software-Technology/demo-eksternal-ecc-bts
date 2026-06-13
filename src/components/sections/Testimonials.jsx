import { FiStar } from 'react-icons/fi'
import { FaQuoteLeft } from 'react-icons/fa6'
import { RevealGroup, RevealItem } from '../ui/Reveal'
import SectionHeading from '../ui/SectionHeading'
import { testimonials } from '../../data/testimonials'

const initials = (name) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

/** Static testimonials grid. */
export default function Testimonials() {
  return (
    <section className="section">
      <div className="container">
        <SectionHeading
          eyebrow="Testimoni"
          title="Apa Kata Mereka"
          subtitle="Cerita dari mahasiswa, dosen, dan peneliti yang telah mempercayakan karyanya kepada kami."
        />
        <RevealGroup className="grid-testi">
          {testimonials.map((t) => (
            <RevealItem className="testi-card" key={t.name}>
              <FaQuoteLeft className="testi-card__quote" />
              <div className="testi-card__stars" aria-label={`${t.rating} dari 5`}>
                {Array.from({ length: t.rating }).map((_, i) => (
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
