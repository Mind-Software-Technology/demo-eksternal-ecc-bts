'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FiArrowRight } from 'react-icons/fi'
import Page from '../../../components/layout/Page'
import PageHero from '../../../components/sections/PageHero'
import CTABand from '../../../components/sections/CTABand'
import { RevealGroup, RevealItem } from '../../../components/ui/Reveal'
import { Icon } from '../../../data/icons'
import { api } from '../../../lib/api'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.categories.list(), api.services.list({ limit: 100 })])
      .then(([cats, { items }]) => {
        setCategories(cats)
        setServices(items)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <Page title="Kategori Layanan — ECC-BTS">
      <PageHero
        title="Kategori Layanan"
        crumb="Kategori"
        subtitle="Telusuri layanan kami berdasarkan kebutuhan Anda — dikelompokkan agar lebih mudah menemukan solusi yang tepat."
      />

      <section className="section">
        <div className="container">
          {loading ? (
            <p className="empty-note">Memuat kategori…</p>
          ) : (
            <RevealGroup className="grid-categories">
              {categories.map((c) => {
                const inCategory = services.filter((s) => s.category?.slug === c.slug)
                return (
                  <RevealItem className="category-card" key={c.slug} data-accent={c.accent}>
                    <div className="category-card__top">
                      <span className="category-card__ic">
                        <Icon name={c.icon} />
                      </span>
                      <div>
                        <h3>{c.title}</h3>
                        <span className="category-card__count">
                          {inCategory.length} layanan
                        </span>
                      </div>
                    </div>
                    <p>{c.short_desc}</p>
                    <div className="category-card__list">
                      {inCategory.map((s) => (
                        <Link href={`/produk?cat=${c.slug}`} key={s.id}>
                          {s.title.replace('Jasa ', '')}
                          <FiArrowRight />
                        </Link>
                      ))}
                    </div>
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
