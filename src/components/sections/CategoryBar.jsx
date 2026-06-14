import { Link } from 'react-router-dom'
import { FiLayers } from 'react-icons/fi'
import { RevealGroup, RevealItem } from '../ui/Reveal'
import SectionHeading from '../ui/SectionHeading'
import { categories } from '../../data/categories'
import { Icon } from '../../data/icons'

/** Horizontal icon bar to browse services by category (marketplace style). */
export default function CategoryBar() {
  return (
    <section className="section section--soft">
      <div className="container">
        <SectionHeading
          eyebrow="Kategori"
          title="Jelajahi Berdasarkan Kategori"
          subtitle="Pilih kategori untuk menemukan layanan yang paling sesuai dengan kebutuhan Anda."
        />
        <RevealGroup className="cat-bar">
          <RevealItem>
            <Link to="/produk" className="cat-pill">
              <span className="cat-pill__ic">
                <FiLayers />
              </span>
              <span>Semua</span>
            </Link>
          </RevealItem>
          {categories.map((c) => (
            <RevealItem key={c.id}>
              <Link
                to={`/produk?cat=${c.id}`}
                className="cat-pill"
                data-accent={c.accent}
              >
                <span className="cat-pill__ic">
                  <Icon name={c.icon} />
                </span>
                <span>{c.short || c.title}</span>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
