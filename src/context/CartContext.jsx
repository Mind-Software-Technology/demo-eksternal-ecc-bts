import { useEffect, useMemo, useState } from 'react'
import { services } from '../data/services'
import { CartContext } from './cart'

// ───────────────────────────────────────────────────────────────────────────
// Cart state (demo). Items are stored as { id, qty } and persisted to
// localStorage so the keranjang survives a page reload. Pricing/details are
// resolved from src/data/services.js on read.
// ───────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'ecc-bts-cart'

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadInitial) // [{ id, qty }]
  const [toast, setToast] = useState(null)

  // Persist on every change.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      /* storage unavailable — ignore */
    }
  }, [items])

  // Auto-dismiss the "added to cart" toast.
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toast])

  const addItem = (id, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((it) => it.id === id)
      if (found) {
        return prev.map((it) =>
          it.id === id ? { ...it, qty: it.qty + qty } : it,
        )
      }
      return [...prev, { id, qty }]
    })
    const svc = services.find((s) => s.id === id)
    setToast(
      svc ? `${svc.title} ditambahkan ke keranjang` : 'Ditambahkan ke keranjang',
    )
  }

  const removeItem = (id) =>
    setItems((prev) => prev.filter((it) => it.id !== id))

  const setQty = (id, qty) =>
    setItems((prev) =>
      qty <= 0
        ? prev.filter((it) => it.id !== id)
        : prev.map((it) => (it.id === id ? { ...it, qty } : it)),
    )

  const clear = () => setItems([])

  // Resolve cart items to full service objects + line totals.
  const detailed = useMemo(
    () =>
      items
        .map((it) => {
          const svc = services.find((s) => s.id === it.id)
          return svc
            ? { ...svc, qty: it.qty, lineTotal: svc.price * it.qty }
            : null
        })
        .filter(Boolean),
    [items],
  )

  const count = useMemo(
    () => items.reduce((n, it) => n + it.qty, 0),
    [items],
  )
  const total = useMemo(
    () => detailed.reduce((n, it) => n + it.lineTotal, 0),
    [detailed],
  )

  const value = {
    items,
    detailed,
    count,
    total,
    addItem,
    removeItem,
    setQty,
    clear,
    toast,
    dismissToast: () => setToast(null),
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
