'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { FiCheck, FiShoppingCart, FiArrowLeft, FiTag } from 'react-icons/fi'
import Page from '../../../../components/layout/Page'
import PageHero from '../../../../components/sections/PageHero'
import CTABand from '../../../../components/sections/CTABand'
import Reveal from '../../../../components/ui/Reveal'
import Rating from '../../../../components/ui/Rating'
import { useCart } from '../../../../context/cart'
import { useAuth, loginUrl } from '../../../../context/auth'
import { api } from '../../../../lib/api'

export default function ProductDetail() {
  const { id: slug } = useParams()
  const router = useRouter()
  const { addItem } = useCart()
  const { user } = useAuth()
  const [service, setService] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resets state before refetching on slug change
    setService(null)
    setNotFound(false)
    api.services
      .show(slug)
      .then((data) => {
        if (!cancelled) setService(data)
      })
      .catch(() => {
        if (!cancelled) setNotFound(true)
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  // Unknown product slug → back to the listing.
  useEffect(() => {
    if (notFound) router.replace('/produk')
  }, [notFound, router])

  if (!service) return null

  const addToCart = () => {
    if (!user) {
      router.push(loginUrl(`/produk/${slug}`))
      return
    }
    addItem(service.id)
  }

  const orderNow = () => {
    if (!user) {
      router.push(loginUrl(`/produk/${slug}`))
      return
    }
    addItem(service.id)
    router.push('/keranjang')
  }

  return (
    <Page title={`${service.title} — ECC-BTS`}>
      <PageHero
        title={service.title}
        crumb={service.title}
        subtitle={service.tagline}
      />

      <section className="section product-detail-section section--tight-top">
        <div className="container product-detail">
          <Reveal className="product-detail__visual" data-accent={service.accent}>
            <img
              className="pv-photo"
              src={service.image_url}
              alt={service.image_alt || service.title}
              decoding="async"
            />
          </Reveal>

          <Reveal className="product-detail__body" delay={0.1}>
            <span className="product-row__tag">{service.tagline}</span>
            <h2>{service.title}</h2>

            <div className="product-detail__rating">
              <Rating value={service.rating} reviews={service.reviews_count} />
            </div>

            <p className="product-detail__quote-note">
              <FiTag className="product-detail__quote-note-ic" aria-hidden="true" />
              <span>
                <b>Harga menyesuaikan kebutuhan.</b> Tambahkan ke keranjang, lalu
                konsultasikan dengan tim kami lewat WhatsApp untuk mendapat penawaran.
              </span>
            </p>

            <p>{service.description}</p>

            <ul className="product-row__points">
              {(service.points || []).map((p) => (
                <li key={p}>
                  <FiCheck /> {p}
                </li>
              ))}
            </ul>

            <div className="product-detail__actions">
              <button
                type="button"
                className="btn btn--primary btn--lg"
                onClick={orderNow}
              >
                Pesan Sekarang
              </button>
              <button
                type="button"
                className="btn btn--outline btn--lg"
                onClick={addToCart}
              >
                <FiShoppingCart /> Tambahkan ke Keranjang
              </button>
            </div>

            <Link href="/produk" className="product-detail__back">
              <FiArrowLeft /> Kembali ke daftar produk
            </Link>
          </Reveal>
        </div>
      </section>

      <CTABand />
    </Page>
  )
}
