// ───────────────────────────────────────────────────────────────────────────
// Payment history (demo). Completed payments are appended to localStorage so
// the user can review their status/history after checkout. Newest first.
// ───────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'ecc-bts-payments'

/** Read all stored payment records (newest first). */
export function getPayments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/** Prepend a new payment record and persist. Returns the updated list. */
export function addPayment(record) {
  const next = [record, ...getPayments()]
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* storage unavailable — ignore */
  }
  return next
}
