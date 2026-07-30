'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  FiTrash2,
  FiPlus,
  FiMinus,
  FiShoppingCart,
  FiArrowRight,
} from 'react-icons/fi'
import Page from '../../../components/layout/Page'
import PageHero from '../../../components/sections/PageHero'
import Reveal from '../../../components/ui/Reveal'
import { useCart } from '../../../context/cart'
import { formatIDR } from '../../../data/format'

export default function Cart() {
  const { detailed, total, count, setQty, removeItem } = useCart()
  const router = useRouter()

  // Proceed to the payment / order-summary page.
  const checkout = () => router.push('/bayar')

  return (
    <Page title="Keranjang — ECC-BTS">
      <PageHero
        title="Keranjang Belanja"
        crumb="Keranjang"
        subtitle="Tinjau layanan yang Anda pilih sebelum memesan."
      />

      <section className="section">
        <div className="container">
          {detailed.length === 0 ? (
            <Reveal className="cart-empty">
              <FiShoppingCart className="cart-empty__ic" />
              <h2>Keranjang Anda masih kosong</h2>
              <p>Jelajahi layanan kami dan tambahkan ke keranjang.</p>
              <Link href="/produk" className="btn btn--blue btn--lg">
                Mulai Belanja <FiArrowRight />
              </Link>
            </Reveal>
          ) : (
            <div className="cart-grid">
              {/* Items */}
              <Reveal className="cart-items">
                {detailed.map((it) => (
                  <div className="cart-item" key={it.cartItemId} data-accent={it.accent}>
                    <Link href={`/produk/${it.slug}`} className="cart-item__thumb">
                      <img src={it.image} alt={it.imageAlt || it.title} />
                    </Link>
                    <div className="cart-item__info">
                      <Link href={`/produk/${it.slug}`} className="cart-item__title">
                        {it.title}
                      </Link>
                      <span className="cart-item__tag">{it.tagline}</span>
                      <span className="cart-item__price">
                        {formatIDR(it.price)}
                      </span>
                    </div>
                    <div className="cart-item__controls">
                      <div className="qty-stepper">
                        <button
                          type="button"
                          aria-label="Kurangi jumlah"
                          onClick={() => setQty(it.cartItemId, it.qty - 1)}
                        >
                          <FiMinus />
                        </button>
                        <span>{it.qty}</span>
                        <button
                          type="button"
                          aria-label="Tambah jumlah"
                          onClick={() => setQty(it.cartItemId, it.qty + 1)}
                        >
                          <FiPlus />
                        </button>
                      </div>
                      <span className="cart-item__line">
                        {formatIDR(it.lineTotal)}
                      </span>
                      <button
                        type="button"
                        className="cart-item__remove"
                        aria-label={`Hapus ${it.title}`}
                        onClick={() => removeItem(it.cartItemId)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))}
              </Reveal>

              {/* Summary */}
              <Reveal className="cart-summary" delay={0.1}>
                <h3>Ringkasan Pesanan</h3>
                <div className="cart-summary__row">
                  <span>Jumlah item</span>
                  <b>{count}</b>
                </div>
                <div className="cart-summary__row">
                  <span>Subtotal</span>
                  <b>{formatIDR(total)}</b>
                </div>
                <div className="cart-summary__row cart-summary__row--total">
                  <span>Total</span>
                  <b>{formatIDR(total)}</b>
                </div>
                <button
                  type="button"
                  className="btn btn--primary btn--block btn--lg"
                  onClick={checkout}
                >
                  Pesan Sekarang
                </button>
                <Link href="/produk" className="cart-summary__continue">
                  ← Lanjut belanja
                </Link>
              </Reveal>
            </div>
          )}
        </div>
      </section>
    </Page>
  )
}
