import { RevealGroup, RevealItem } from '../ui/Reveal'
import SectionHeading from '../ui/SectionHeading'
import { processSteps } from '../../data/process'
import { Icon } from '../../data/icons'

/** How it works — 4 steps. */
export default function ProcessSteps() {
  return (
    <section className="section section--soft">
      <div className="container">
        <SectionHeading
          eyebrow="Cara Kerja"
          title="Mudah, Cepat, & Transparan"
          subtitle="Hanya empat langkah dari konsultasi hingga karya Anda selesai."
        />
        <RevealGroup className="process">
          {processSteps.map((p) => (
            <RevealItem className="process-step" key={p.step}>
              <span className="process-step__ic" aria-hidden="true">
                <Icon name={p.icon} />
              </span>
              <div className="process-step__num">{p.step}</div>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
