'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FiTrash2, FiShoppingCart, FiArrowRight } from 'react-icons/fi'
import Page from '../../../components/layout/Page'
import PageHero from '../../../components/sections/PageHero'
import Reveal from '../../../components/ui/Reveal'
import { useCart } from '../../../context/cart'
import { useAuth, loginUrl } from '../../../context/auth'
import { setSelectedCartItemIds } from '../../../lib/checkoutSelectionCache'

export default function Cart() {
  const { detailed, removeItem } = useCart()
  const { user, ready: authReady } = useAuth()
  const router = useRouter()

  // Tracked as "unchecked" rather than "checked" so a newly added cart item
  // (never seen before) defaults to selected without needing an effect to
  // seed it — it's just absent from this set.
  const [deselected, setDeselected] = useState(() => new Set())

  // Cart is account-only — bounce a logged-out visitor to login.
  useEffect(() => {
    if (authReady && !user) router.replace(loginUrl('/keranjang'))
  }, [authReady, user, router])

  if (!authReady || !user) return null

  const toggleItem = (cartItemId) => {
    setDeselected((prev) => {
      const next = new Set(prev)
      if (next.has(cartItemId)) next.delete(cartItemId)
      else next.add(cartItemId)
      return next
    })
  }

  const selectedItems = detailed.filter((it) => !deselected.has(it.cartItemId))
  const allSelected = selectedItems.length === detailed.length && detailed.length > 0

  const toggleSelectAll = () => {
    setDeselected(allSelected ? new Set(detailed.map((it) => it.cartItemId)) : new Set())
  }

  // Proceed to step 1 of checkout — orderer info + attachments — before payment.
  const checkout = () => {
    setSelectedCartItemIds(selectedItems.map((it) => it.cartItemId))
    router.push('/bayar/data')
  }

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
              <Link href="/produk" className="btn btn--primary btn--lg">
                Mulai Belanja <FiArrowRight />
              </Link>
            </Reveal>
          ) : (
            <div className="cart-grid">
              {/* Items */}
              <Reveal className="cart-items">
                <div className="cart-select-all">
                  <label className="cart-checkbox">
                    <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
                    <span>Pilih Semua</span>
                  </label>
                  <span className="cart-select-all__count">
                    {selectedItems.length} dari {detailed.length} dipilih
                  </span>
                </div>

                {detailed.map((it) => {
                  const checked = !deselected.has(it.cartItemId)
                  return (
                    <div
                      className={`cart-item ${checked ? '' : 'cart-item--unselected'}`}
                      key={it.cartItemId}
                      data-accent={it.accent}
                    >
                      <label className="cart-checkbox cart-item__checkbox">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleItem(it.cartItemId)}
                          aria-label={`Pilih ${it.title}`}
                        />
                      </label>
                      <Link href={`/produk/${it.slug}`} className="cart-item__thumb">
                        <img
                          src={it.image}
                          alt={it.imageAlt || it.title}
                          loading="lazy"
                          decoding="async"
                        />
                      </Link>
                      <div className="cart-item__info">
                        <Link href={`/produk/${it.slug}`} className="cart-item__title">
                          {it.title}
                        </Link>
                        <span className="cart-item__tag">{it.tagline}</span>
                      </div>
                      <div className="cart-item__controls">
                        <div className="qty-stepper qty-stepper--readonly" aria-label="Jumlah">
                          <span>{it.qty}</span>
                        </div>
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
                  )
                })}
              </Reveal>

              {/* Summary */}
              <Reveal className="cart-summary" delay={0.1}>
                <h3>Ringkasan Pesanan</h3>
                <div className="cart-summary__row">
                  <span>Layanan dipilih</span>
                  <b>{selectedItems.length} dari {detailed.length}</b>
                </div>
                <div className="cart-summary__row cart-summary__row--total">
                  <span>Total</span>
                  <b>Setelah konsultasi</b>
                </div>
                <p className="cart-summary__note">
                  Harga tiap naskah berbeda, jadi ditentukan lewat konsultasi WhatsApp
                  setelah Anda memesan. Anda baru membayar setelah menyetujui penawaran.
                </p>
                <button
                  type="button"
                  className="btn btn--primary btn--block btn--lg"
                  onClick={checkout}
                  disabled={selectedItems.length === 0}
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
