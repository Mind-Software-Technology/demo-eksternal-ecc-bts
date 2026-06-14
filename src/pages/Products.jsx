import { Link, useSearchParams } from 'react-router-dom'
import { FiShoppingCart, FiX } from 'react-icons/fi'
import Page from '../components/layout/Page'
import PageHero from '../components/sections/PageHero'
import CTABand from '../components/sections/CTABand'
import { RevealGroup, RevealItem } from '../components/ui/Reveal'
import Rating from '../components/ui/Rating'
import { services } from '../data/services'
import { categories } from '../data/categories'
import { formatIDR } from '../data/format'
import { useCart } from '../context/cart'

const filters = [{ id: 'all', title: 'Semua' }, ...categories]

export default function Products() {
  const [params, setParams] = useSearchParams()
  const { addItem } = useCart()

  const active = params.get('cat') || 'all'
  const query = (params.get('q') || '').trim()
  const q = query.toLowerCase()

  const setActive = (id) => {
    const next = {}
    if (id !== 'all') next.cat = id
    if (query) next.q = query
    setParams(next, { replace: true })
  }

  const clearSearch = () => {
    const next = {}
    if (active !== 'all') next.cat = active
    setParams(next, { replace: true })
  }

  let list = active === 'all' ? services : services.filter((s) => s.categoryId === active)
  if (q) {
    list = list.filter((s) =>
      `${s.title} ${s.tagline} ${s.description}`.toLowerCase().includes(q),
    )
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

          {/* Active search note */}
          {query && (
            <div className="search-note">
              <span>
                Menampilkan {list.length} hasil untuk “<b>{query}</b>”
              </span>
              <button type="button" onClick={clearSearch}>
                <FiX /> Hapus pencarian
              </button>
            </div>
          )}

          {/* Product cards */}
          {list.length === 0 ? (
            <p className="empty-note">
              Tidak ada layanan yang cocok. Coba kata kunci atau kategori lain.
            </p>
          ) : (
            <RevealGroup className="grid-products">
              {list.map((s) => (
                <RevealItem key={s.id}>
                  <article className="product-card" data-accent={s.accent}>
                    <Link
                      to={`/produk/${s.id}`}
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
                        src={s.image}
                        alt={s.imageAlt || s.title}
                        loading="lazy"
                      />
                    </Link>
                    <div className="product-card__body">
                      <h3>
                        <Link to={`/produk/${s.id}`}>{s.title}</Link>
                      </h3>
                      <p className="product-card__desc">{s.tagline}</p>
                      <Rating value={s.rating} reviews={s.reviews} />
                      <div className="product-card__foot">
                        <span className="price-tag">{formatIDR(s.price)}</span>
                        <div className="product-card__actions">
                          <Link
                            to={`/produk/${s.id}`}
                            className="btn btn--outline btn--sm"
                          >
                            Detail
                          </Link>
                          <button
                            type="button"
                            className="btn btn--blue btn--sm"
                            aria-label={`Tambah ${s.title} ke keranjang`}
                            onClick={() => addItem(s.id)}
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
