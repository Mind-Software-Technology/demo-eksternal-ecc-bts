import { RevealGroup, RevealItem } from '../ui/Reveal'
import Counter from '../ui/Counter'
import { stats } from '../../data/stats'

/** Dark band with animated counters. */
export default function StatsBand() {
  return (
    <section className="section section--dark">
      <div className="container">
        <RevealGroup className="stats">
          {stats.map((s) => (
            <RevealItem className="stat" key={s.label}>
              <div className="stat__value">
                <Counter value={s.value} suffix={s.suffix} />
              </div>
              <div className="stat__label">{s.label}</div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
