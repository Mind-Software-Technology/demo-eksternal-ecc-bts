'use client'

import { useEffect, useState } from 'react'
import { RevealGroup, RevealItem } from '../ui/Reveal'
import Counter from '../ui/Counter'
import { api } from '../../lib/api'

/** Dark band with animated counters. */
export default function StatsBand() {
  const [stats, setStats] = useState([])

  useEffect(() => {
    api.stats.list().then(setStats).catch(() => {})
  }, [])

  return (
    <section className="section section--dark">
      <div className="container">
        <RevealGroup className="stats">
          {stats.map((s) => (
            <RevealItem className="stat" key={s.id}>
              <div className="stat__value">
                <Counter value={Number(s.value) || 0} suffix={s.suffix} />
              </div>
              <div className="stat__label">{s.label}</div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
