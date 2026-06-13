import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import Page from '../components/layout/Page'
import PageHero from '../components/sections/PageHero'
import CTABand from '../components/sections/CTABand'
import { RevealGroup, RevealItem } from '../components/ui/Reveal'
import { categories } from '../data/categories'
import { getServiceById } from '../data/services'
import { Icon } from '../data/icons'

export default function Categories() {
  return (
    <Page title="Kategori Layanan — ECC-BTS">
      <PageHero
        title="Kategori Layanan"
        crumb="Kategori"
        subtitle="Telusuri layanan kami berdasarkan kebutuhan Anda — dikelompokkan agar lebih mudah menemukan solusi yang tepat."
      />

      <section className="section">
        <div className="container">
          <RevealGroup className="grid-categories">
            {categories.map((c) => (
              <RevealItem className="category-card" key={c.id} data-accent={c.accent}>
                <div className="category-card__top">
                  <span className="category-card__ic">
                    <Icon name={c.icon} />
                  </span>
                  <div>
                    <h3>{c.title}</h3>
                    <span className="category-card__count">
                      {c.serviceIds.length} layanan
                    </span>
                  </div>
                </div>
                <p>{c.desc}</p>
                <div className="category-card__list">
                  {c.serviceIds.map((id) => {
                    const s = getServiceById(id)
                    if (!s) return null
                    return (
                      <Link to="/produk" key={id}>
                        {s.title.replace('Jasa ', '')}
                        <FiArrowRight />
                      </Link>
                    )
                  })}
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <CTABand />
    </Page>
  )
}
