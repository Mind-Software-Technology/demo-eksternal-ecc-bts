import { RevealGroup, RevealItem } from '../ui/Reveal'
import SectionHeading from '../ui/SectionHeading'
import { advantages } from '../../data/advantages'
import { Icon } from '../../data/icons'

/** The four trust advantages. */
export default function WhyChooseUs() {
  return (
    <section className="section">
      <div className="container">
        <SectionHeading
          eyebrow="Mengapa ECC-BTS"
          title="Komitmen Kami untuk Anda"
          subtitle="Kepercayaan Anda adalah prioritas. Inilah yang membuat ribuan klien memilih ECC-BTS."
        />
        <RevealGroup className="grid-why">
          {advantages.map((a) => (
            <RevealItem className="why-card" key={a.title}>
              <div className="why-card__ic">
                <Icon name={a.icon} />
              </div>
              <h3>{a.title}</h3>
              <p>{a.desc}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
