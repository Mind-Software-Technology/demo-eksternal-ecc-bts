import { createContext, useContext } from 'react'

// Context object + consumer hook live here (no component exports) so the
// provider file can stay Fast-Refresh friendly.
export const CartContext = createContext(null)

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart harus dipakai di dalam <CartProvider>')
  return ctx
}
