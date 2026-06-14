import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { FiCheck, FiShoppingCart, FiArrowLeft } from 'react-icons/fi'
import Page from '../components/layout/Page'
import PageHero from '../components/sections/PageHero'
import CTABand from '../components/sections/CTABand'
import Reveal from '../components/ui/Reveal'
import Rating from '../components/ui/Rating'
import { getServiceById } from '../data/services'
import { formatIDR } from '../data/format'
import { useCart } from '../context/cart'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const service = getServiceById(id)

  // Unknown product id → back to the listing.
  if (!service) return <Navigate to="/produk" replace />

  const orderNow = () => {
    addItem(service.id)
    navigate('/keranjang')
  }

  return (
    <Page title={`${service.title} — ECC-BTS`}>
      <PageHero
        title={service.title}
        crumb={service.title}
        subtitle={service.tagline}
      />

      <section className="section product-detail-section">
        <div className="container product-detail">
          <Reveal className="product-detail__visual" data-accent={service.accent}>
            <span className="pv-num" aria-hidden="true">
              {service.number}
            </span>
            <img
              className="pv-photo"
              src={service.image}
              alt={service.imageAlt || service.title}
            />
          </Reveal>

          <Reveal className="product-detail__body" delay={0.1}>
            <span className="product-row__tag">{service.tagline}</span>
            <h2>{service.title}</h2>

            <div className="product-detail__rating">
              <Rating value={service.rating} reviews={service.reviews} />
            </div>

            <div className="price-tag price-tag--lg">
              {formatIDR(service.price)}
              <small>/ layanan</small>
            </div>

            <p>{service.description}</p>

            <ul className="product-row__points">
              {service.points.map((p) => (
                <li key={p}>
                  <FiCheck /> {p}
                </li>
              ))}
            </ul>

            <div className="product-detail__actions">
              <button
                type="button"
                className="btn btn--blue btn--lg"
                onClick={orderNow}
              >
                Pesan Sekarang
              </button>
              <button
                type="button"
                className="btn btn--outline btn--lg"
                onClick={() => addItem(service.id)}
              >
                <FiShoppingCart /> Tambahkan ke Keranjang
              </button>
            </div>

            <Link to="/produk" className="product-detail__back">
              <FiArrowLeft /> Kembali ke daftar produk
            </Link>
          </Reveal>
        </div>
      </section>

      <CTABand />
    </Page>
  )
}
