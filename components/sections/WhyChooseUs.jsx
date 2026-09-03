'use client'

import { RevealGroup, RevealItem } from '../ui/Reveal'
import SectionHeading from '../ui/SectionHeading'
import { Icon } from '../../data/icons'
import { useAdvantages } from '../../hooks/useAdvantages'

/** The trust advantages. */
export default function WhyChooseUs() {
  const advantages = useAdvantages()

  return (
    <section className="section section--soft">
      <div className="container">
        <SectionHeading
          eyebrow="Mengapa ECC-BTS"
          title="Komitmen Kami untuk Anda"
          subtitle="Kepercayaan Anda adalah prioritas. Inilah yang membuat ribuan klien memilih ECC-BTS."
        />
        <RevealGroup className="grid-why">
          {advantages.map((a) => (
            <RevealItem className="why-card" key={a.id}>
              <div className="why-card__ic">
                <Icon name={a.icon} />
              </div>
              <h3>{a.title}</h3>
              <p>{a.description}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
