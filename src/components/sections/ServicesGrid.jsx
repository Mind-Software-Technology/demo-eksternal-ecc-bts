import { RevealGroup, RevealItem } from '../ui/Reveal'
import SectionHeading from '../ui/SectionHeading'
import ServiceCard from '../ui/ServiceCard'
import { services } from '../../data/services'

/** Grid of all six services. */
export default function ServicesGrid({
  eyebrow = 'Layanan Kami',
  title = 'Layanan Unggulan ECC-BTS',
  subtitle = 'Enam layanan untuk mendukung setiap tahap karya ilmiah Anda — dari penulisan hingga publikasi.',
}) {
  return (
    <section className="section section--soft">
      <div className="container">
        <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />
        <RevealGroup className="grid-services">
          {services.map((s) => (
            <RevealItem key={s.id}>
              <ServiceCard service={s} />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
