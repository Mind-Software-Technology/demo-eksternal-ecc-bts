'use client'

import Link from 'next/link'
import { FiLayers } from 'react-icons/fi'
import { RevealGroup, RevealItem } from '../ui/Reveal'
import SectionHeading from '../ui/SectionHeading'
import { Icon } from '../../data/icons'
import { useCategories } from '../../hooks/useCategories'

/** Horizontal icon bar to browse services by category (marketplace style). */
export default function CategoryBar() {
  const categories = useCategories()

  return (
    <section className="section section--soft">
      <div className="container">
        <SectionHeading
          eyebrow="Kategori"
          title="Jelajahi Berdasarkan Kategori"
          subtitle="Pilih kategori untuk menemukan layanan yang paling sesuai dengan kebutuhan Anda."
          className="heading--nowrap"
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
              <Link href={`/produk?cat=${c.slug}`} className="cat-pill">
                <span className="cat-pill__ic">
                  <Icon name={c.icon} />
                </span>
                <span>{c.title}</span>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
