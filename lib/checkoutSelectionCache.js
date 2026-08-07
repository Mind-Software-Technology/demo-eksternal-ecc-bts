// In-memory hand-off for which cart items the customer checked at
// /keranjang, so /bayar/data can send only those to the backend when it
// creates the order. Same pattern as checkoutOrderCache.js: survives the
// client-side navigation between the two pages, but intentionally isn't
// persisted anywhere — a direct visit/refresh on /bayar/data just falls
// back to "no selection", which the backend treats as "checkout everything".
let cachedIds = null

export function setSelectedCartItemIds(ids) {
  cachedIds = ids
}

// Consume-once: cleared on read so a later refresh doesn't replay a stale selection.
export function takeSelectedCartItemIds() {
  const ids = cachedIds
  cachedIds = null
  return ids
}
