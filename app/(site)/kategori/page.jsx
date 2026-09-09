'use client'

import Link from 'next/link'
import Page from '../../../components/layout/Page'
import PageHero from '../../../components/sections/PageHero'
import CTABand from '../../../components/sections/CTABand'
import { RevealGroup, RevealItem } from '../../../components/ui/Reveal'
import { Icon } from '../../../data/icons'
import { useCategories } from '../../../hooks/useCategories'
import { useServices } from '../../../hooks/useServices'

export default function Categories() {
  const categories = useCategories()
  const { items: services, loading } = useServices({ limit: 100 })

  return (
    <Page title="Kategori Layanan — ECC-BTS">
      <PageHero
        title="Kategori Layanan"
        crumb="Kategori"
        subtitle="Telusuri layanan kami berdasarkan kebutuhan Anda — dikelompokkan agar lebih mudah menemukan solusi yang tepat."
      />

      <section className="section section--tight-top">
        <div className="container">
          {loading ? (
            <p className="empty-note">Memuat kategori…</p>
          ) : (
            <RevealGroup className="grid-categories">
              {categories.map((c) => {
                const count = services.filter((s) => s.category?.slug === c.slug).length
                return (
                  <RevealItem key={c.slug}>
                    <Link href={`/produk?cat=${c.slug}`} className="category-card">
                      <div className="category-card__top">
                        <span className="category-card__ic">
                          <Icon name={c.icon} />
                        </span>
                        <div>
                          <h3>{c.title}</h3>
                          <span className="category-card__count">{count} layanan</span>
                        </div>
                      </div>
                      <p>{c.short_desc}</p>
                    </Link>
                  </RevealItem>
                )
              })}
            </RevealGroup>
          )}
        </div>
      </section>

      <CTABand />
    </Page>
  )
}
