// In-memory hand-off for the order just created in step 1 (/bayar/data) so
// step 2 (/bayar) can render immediately instead of re-fetching the same
// order over the network and flashing blank while it waits. Survives the
// client-side navigation between the two (same SPA runtime, no page reload)
// but intentionally isn't persisted anywhere — a direct visit/refresh on
// /bayar falls back to fetching from the API, which is what we want.
let cached = null

export function setCachedOrder(order) {
  cached = order
}

// Consume-once: cleared on read so a later refresh always re-fetches fresh data.
export function takeCachedOrder(orderNo) {
  if (cached && cached.order_no === orderNo) {
    const order = cached
    cached = null
    return order
  }
  return null
}
