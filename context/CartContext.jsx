'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { CartContext } from './cart'
import { useAuth } from './auth'

// ───────────────────────────────────────────────────────────────────────────
// Cart state is sourced from the Laravel API. Cart/checkout require a
// logged-in Sanctum session — there is no guest cart — so fetching is driven
// entirely by auth state (see lib/api.js).
// ───────────────────────────────────────────────────────────────────────────

const EMPTY_CART = { session_id: null, items: [], subtotal: 0, total: 0 }

export function CartProvider({ children }) {
  const [cart, setCart] = useState(EMPTY_CART)
  const [toast, setToast] = useState(null)
  // False until the cart has resolved at least once (fetched, or settled to
  // empty for a logged-out visitor). Pages that redirect based on an empty
  // cart (e.g. /bayar) must wait for this — otherwise they'd bounce away
  // before the real cart loads.
  const [ready, setReady] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const data = await api.cart.show()
      setCart(data)
    } catch {
      /* keep last-known cart on transient errors */
    } finally {
      setReady(true)
    }
  }, [])

  // Only fetch once auth has resolved, and only when actually logged in —
  // logged-out visitors never have a cart to fetch. Re-runs whenever the
  // logged-in identity changes (login/logout/switch account) so stale
  // cross-identity items never linger in the UI.
  const { user, ready: authReady } = useAuth()
  useEffect(() => {
    if (!authReady) return
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- fetches the logged-in user's cart once identity resolves/changes
      refresh()
    } else {
      setCart(EMPTY_CART)
      setReady(true)
    }
  }, [authReady, user, refresh])

  // Auto-dismiss the toast.
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toast])

  const addItem = useCallback(async (serviceId, qty = 1) => {
    try {
      const data = await api.cart.addItem(serviceId, qty)
      setCart(data)
      const item = data.items?.find((it) => it.service_id === serviceId)
      setToast(
        item?.service?.title
          ? `${item.service.title} ditambahkan ke keranjang`
          : 'Ditambahkan ke keranjang',
      )
    } catch (e) {
      setToast(e.message || 'Gagal menambahkan ke keranjang')
    }
  }, [])

  const setQty = useCallback(async (cartItemId, qty) => {
    try {
      const data =
        qty <= 0
          ? await api.cart.removeItem(cartItemId)
          : await api.cart.updateItem(cartItemId, qty)
      setCart(data)
    } catch (e) {
      setToast(e.message || 'Gagal memperbarui keranjang')
    }
  }, [])

  const removeItem = useCallback(async (cartItemId) => {
    try {
      setCart(await api.cart.removeItem(cartItemId))
    } catch (e) {
      setToast(e.message || 'Gagal menghapus item')
    }
  }, [])

  const clear = useCallback(async () => {
    try {
      setCart(await api.cart.clear())
    } catch (e) {
      setToast(e.message || 'Gagal mengosongkan keranjang')
    }
  }, [])

  // Resolve raw cart items into the shape pages render.
  const detailed = useMemo(
    () =>
      (cart.items || []).map((it) => ({
        cartItemId: it.id,
        serviceId: it.service_id,
        slug: it.service?.slug,
        title: it.service?.title,
        tagline: it.service?.tagline,
        image: it.service?.image_url,
        imageAlt: it.service?.image_alt,
        accent: it.service?.accent,
        qty: it.qty,
        requiresAttachment: it.service?.requires_attachment ?? false,
      })),
    [cart.items],
  )

  const count = useMemo(
    () => (cart.items || []).reduce((n, it) => n + it.qty, 0),
    [cart.items],
  )

  // Harga tidak lagi diketahui di tahap keranjang — admin menetapkannya per
  // pesanan setelah konsultasi WhatsApp, jadi tidak ada total untuk dipajang.
  const value = {
    detailed,
    count,
    ready,
    addItem,
    removeItem,
    setQty,
    clear,
    refresh,
    toast,
    dismissToast: () => setToast(null),
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
