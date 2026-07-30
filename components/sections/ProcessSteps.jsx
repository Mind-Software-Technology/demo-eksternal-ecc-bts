'use client'

import { useEffect, useState } from 'react'
import { RevealGroup, RevealItem } from '../ui/Reveal'
import SectionHeading from '../ui/SectionHeading'
import { Icon } from '../../data/icons'
import { api } from '../../lib/api'

/** How it works. */
export default function ProcessSteps() {
  const [processSteps, setProcessSteps] = useState([])

  useEffect(() => {
    api.processSteps.list().then(setProcessSteps).catch(() => {})
  }, [])

  return (
    <section className="section">
      <div className="container">
        <SectionHeading
          eyebrow="Cara Kerja"
          title="Mudah, Cepat, & Transparan"
          subtitle="Langkah mudah dari konsultasi hingga karya Anda selesai."
        />
        <RevealGroup className="process">
          {processSteps.map((p) => (
            <RevealItem className="process-step" key={p.id}>
              <span className="process-step__ic" aria-hidden="true">
                <Icon name={p.icon} />
              </span>
              <div className="process-step__num">
                {String(p.step_number).padStart(2, '0')}
              </div>
              <h3>{p.title}</h3>
              <p>{p.description}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
