'use client'

import { useEffect, useState } from 'react'
import { RevealGroup, RevealItem } from '../ui/Reveal'
import SectionHeading from '../ui/SectionHeading'
import ServiceCard from '../ui/ServiceCard'
import { api } from '../../lib/api'

/** Grid of the top services. */
export default function ServicesGrid({
  eyebrow = 'Layanan Kami',
  title = 'Layanan Unggulan ECC-BTS',
  subtitle = 'Layanan untuk mendukung setiap tahap karya ilmiah Anda — dari penulisan hingga publikasi.',
}) {
  const [services, setServices] = useState([])

  useEffect(() => {
    api.services
      .list({ limit: 6 })
      .then(({ items }) => setServices(items))
      .catch(() => {})
  }, [])

  return (
    <section className="section section--dark">
      <span
        className="blob"
        aria-hidden="true"
        style={{ background: 'var(--secondary)', width: 280, height: 280, top: -110, right: -70, opacity: 0.25 }}
      />
      <span
        className="blob"
        aria-hidden="true"
        style={{ background: 'var(--blue-500)', width: 240, height: 240, bottom: -120, left: -60, opacity: 0.3 }}
      />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} dark />
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
