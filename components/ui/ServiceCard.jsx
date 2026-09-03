import Link from 'next/link'
import { FiCheck, FiArrowRight } from 'react-icons/fi'
import { Icon } from '../../data/icons'

/** Compact service card used in grids (Home & Products preview). */
export default function ServiceCard({ service }) {
  return (
    <article className="service-card">
      <div className="service-card__icon">
        <Icon name={service.icon} />
      </div>
      <h3>{service.title}</h3>
      <p className="service-card__tag">{service.tagline}</p>
      <ul className="service-card__points">
        {(service.points || []).slice(0, 3).map((p) => (
          <li key={p}>
            <FiCheck /> {p}
          </li>
        ))}
      </ul>
      <Link href={`/produk/${service.slug}`} className="service-card__link">
        Selengkapnya <FiArrowRight />
      </Link>
    </article>
  )
}
