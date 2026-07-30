'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { CartContext } from './cart'

// ───────────────────────────────────────────────────────────────────────────
// Cart state is now sourced from the Laravel API (guest via a server-assigned
// X-Session-Id header, persisted user via the Sanctum session cookie — see
// lib/api.js). The server is the source of truth for items/prices/totals.
// ───────────────────────────────────────────────────────────────────────────

const EMPTY_CART = { session_id: null, items: [], subtotal: 0, total: 0 }

export function CartProvider({ children }) {
  const [cart, setCart] = useState(EMPTY_CART)
  const [toast, setToast] = useState(null)
  // False until the cart has been fetched at least once. Pages that redirect
  // based on an empty cart (e.g. /bayar) must wait for this — otherwise
  // they'd bounce away before the real cart loads.
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial cart fetch on mount
    refresh()
  }, [refresh])

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
        price: it.price,
        qty: it.qty,
        lineTotal: it.line_total,
      })),
    [cart.items],
  )

  const count = useMemo(
    () => (cart.items || []).reduce((n, it) => n + it.qty, 0),
    [cart.items],
  )

  const value = {
    detailed,
    count,
    total: cart.total || 0,
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
