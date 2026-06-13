import { useState } from 'react'
import { FiCheck } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa6'
import Page from '../components/layout/Page'
import PageHero from '../components/sections/PageHero'
import CTABand from '../components/sections/CTABand'
import Reveal from '../components/ui/Reveal'
import { services } from '../data/services'
import { categories } from '../data/categories'
import { Icon } from '../data/icons'
import { waLink } from '../data/site'

const filters = [{ id: 'all', title: 'Semua' }, ...categories]

export default function Products() {
  const [active, setActive] = useState('all')
  const list =
    active === 'all'
      ? services
      : services.filter((s) => s.categoryId === active)

  return (
    <Page title="Produk & Layanan — ECC-BTS">
      <PageHero
        title="Produk & Layanan"
        crumb="Produk"
        subtitle="Layanan lengkap untuk mendukung karya ilmiah Anda — dipilih sesuai kebutuhan, dikerjakan oleh tim ahli."
      />

      <section className="section">
        <div className="container">
          {/* Category filter */}
          <div className="filter-tabs" role="tablist" aria-label="Filter kategori">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={active === f.id}
                className={`filter-tab ${active === f.id ? 'active' : ''}`}
                onClick={() => setActive(f.id)}
              >
                {f.title}
              </button>
            ))}
          </div>

          {/* Detailed product rows */}
          <div>
            {list.map((s) => (
              <Reveal className="product-row" key={s.id} data-accent={s.accent}>
                <div className="product-row__visual">
                  <span className="pv-num" aria-hidden="true">
                    {s.number}
                  </span>
                  <span className="pv-icon">
                    <Icon name={s.icon} />
                  </span>
                </div>
                <div className="product-row__body">
                  <span className="product-row__tag">{s.tagline}</span>
                  <h2>{s.title}</h2>
                  <p>{s.description}</p>
                  <ul className="product-row__points">
                    {s.points.map((p) => (
                      <li key={p}>
                        <FiCheck /> {p}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={waLink(`Halo ECC-BTS, saya tertarik dengan ${s.title}.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn--wa product-row__cta"
                  >
                    <FaWhatsapp /> Pesan Layanan Ini
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTABand />
    </Page>
  )
}
