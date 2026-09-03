'use client'

import { RevealGroup, RevealItem } from '../ui/Reveal'
import SectionHeading from '../ui/SectionHeading'
import { useProcessSteps } from '../../hooks/useProcessSteps'

/** How it works. */
export default function ProcessSteps() {
  const processSteps = useProcessSteps()

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
              <div className="process-step__num">
                {String(p.step_number).padStart(2, '0')}
              </div>
              <div className="process-step__body">
                <h3>{p.title}</h3>
                <p>{p.description}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
