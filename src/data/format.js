// ───────────────────────────────────────────────────────────────────────────
// Formatting helpers shared across pages.
// ───────────────────────────────────────────────────────────────────────────

/** Format a number as Indonesian Rupiah, e.g. 900000 → "Rp 900.000". */
export const formatIDR = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
