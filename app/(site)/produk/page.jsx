'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { FiShoppingCart, FiX } from 'react-icons/fi'
import Page from '../../../components/layout/Page'
import PageHero from '../../../components/sections/PageHero'
import CTABand from '../../../components/sections/CTABand'
import { RevealGroup, RevealItem } from '../../../components/ui/Reveal'
import Rating from '../../../components/ui/Rating'
import { useCart } from '../../../context/cart'
import { useAuth, loginUrl } from '../../../context/auth'
import { api } from '../../../lib/api'

function ProductsContent() {
  const params = useSearchParams()
  const router = useRouter()
  const { addItem } = useCart()
  const { user } = useAuth()

  const addToCart = (serviceId) => {
    if (!user) {
      router.push(loginUrl('/produk'))
      return
    }
    addItem(serviceId)
  }

  const active = params.get('cat') || 'all'
  const query = (params.get('q') || '').trim()

  const [categories, setCategories] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.categories.list().then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resets loading/error state before refetching on filter change
    setLoading(true)
    setError(null)
    api.services
      .list({ category: active === 'all' ? undefined : active, q: query || undefined, limit: 100 })
      .then(({ items }) => {
        if (!cancelled) setServices(items)
      })
      .catch((e) => {
        if (!cancelled) setError(e.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [active, query])

  const filters = [{ slug: 'all', title: 'Semua' }, ...categories]

  const pushParams = (next) => {
    const usp = new URLSearchParams(next)
    const qs = usp.toString()
    router.replace(qs ? `/produk?${qs}` : '/produk')
  }

  const setActive = (slug) => {
    const next = {}
    if (slug !== 'all') next.cat = slug
    if (query) next.q = query
    pushParams(next)
  }

  const clearSearch = () => {
    const next = {}
    if (active !== 'all') next.cat = active
    pushParams(next)
  }

  return (
    <Page title="Produk & Layanan — ECC-BTS">
      <PageHero
        title="Produk & Layanan"
        crumb="Produk"
        subtitle="Layanan lengkap untuk mendukung karya ilmiah Anda — dipilih sesuai kebutuhan, dikerjakan oleh tim ahli."
      />

      <section className="section section--soft">
        <div className="container">
          {/* Category filter */}
          <div className="filter-tabs" role="tablist" aria-label="Filter kategori">
            {filters.map((f) => (
              <button
                key={f.slug}
                type="button"
                role="tab"
                aria-selected={active === f.slug}
                className={`filter-tab ${active === f.slug ? 'active' : ''}`}
                onClick={() => setActive(f.slug)}
              >
                {f.title}
              </button>
            ))}
          </div>

          {/* Active search note */}
          {query && (
            <div className="search-note">
              <span>
                Menampilkan {services.length} hasil untuk “<b>{query}</b>”
              </span>
              <button type="button" onClick={clearSearch}>
                <FiX /> Hapus pencarian
              </button>
            </div>
          )}

          {/* Product cards */}
          {loading ? (
            <p className="empty-note">Memuat layanan…</p>
          ) : error ? (
            <p className="empty-note">Gagal memuat layanan: {error}</p>
          ) : services.length === 0 ? (
            <p className="empty-note">
              Tidak ada layanan yang cocok. Coba kata kunci atau kategori lain.
            </p>
          ) : (
            <RevealGroup className="grid-products">
              {services.map((s) => (
                <RevealItem key={s.id} className="product-card__wrap">
                  <article className="product-card" data-accent={s.accent}>
                    <Link
                      href={`/produk/${s.slug}`}
                      className="product-card__media"
                      aria-label={`Lihat detail ${s.title}`}
                    >
                      {s.badge && (
                        <span
                          className={`product-card__badge ${
                            s.badge === 'Baru' ? 'is-new' : ''
                          }`}
                        >
                          {s.badge}
                        </span>
                      )}
                      <img
                        className="pv-photo"
                        src={s.image_url}
                        alt={s.image_alt || s.title}
                        loading="lazy"
                      />
                    </Link>
                    <div className="product-card__body">
                      <h3>
                        <Link href={`/produk/${s.slug}`}>{s.title}</Link>
                      </h3>
                      <p className="product-card__desc">{s.tagline}</p>
                      <Rating value={s.rating} reviews={s.reviews_count} />
                      <div className="product-card__foot">
                        <div className="product-card__actions">
                          <Link
                            href={`/produk/${s.slug}`}
                            className="btn btn--outline btn--sm"
                          >
                            Detail
                          </Link>
                          <button
                            type="button"
                            className="btn btn--blue btn--sm"
                            aria-label={`Tambah ${s.title} ke keranjang`}
                            onClick={() => addToCart(s.id)}
                          >
                            <FiShoppingCart /> Keranjang
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                </RevealItem>
              ))}
            </RevealGroup>
          )}
        </div>
      </section>

      <CTABand />
    </Page>
  )
}

export default function Products() {
  return (
    <Suspense fallback={null}>
      <ProductsContent />
    </Suspense>
  )
}
