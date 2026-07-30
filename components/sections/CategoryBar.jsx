'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FiLayers } from 'react-icons/fi'
import { RevealGroup, RevealItem } from '../ui/Reveal'
import SectionHeading from '../ui/SectionHeading'
import { Icon } from '../../data/icons'
import { api } from '../../lib/api'

/** Horizontal icon bar to browse services by category (marketplace style). */
export default function CategoryBar() {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    api.categories.list().then(setCategories).catch(() => {})
  }, [])

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
            <Link href="/produk" className="cat-pill">
              <span className="cat-pill__ic">
                <FiLayers />
              </span>
              <span>Semua</span>
            </Link>
          </RevealItem>
          {categories.map((c) => (
            <RevealItem key={c.slug}>
              <Link
                href={`/produk?cat=${c.slug}`}
                className="cat-pill"
                data-accent={c.accent}
              >
                <span className="cat-pill__ic">
                  <Icon name={c.icon} />
                </span>
                <span>{c.short_desc || c.title}</span>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
