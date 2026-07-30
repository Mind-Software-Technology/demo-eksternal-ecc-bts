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

/** Format an ISO date/time as e.g. "12 Agustus 2026, 09.00". */
export const formatEventDate = (iso) =>
  iso
    ? new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(iso))
    : null

/** Format an ISO date only, e.g. "12 Agustus 2026". */
export const formatEventDay = (iso) =>
  iso
    ? new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(iso))
    : null

/** Compact ISO date for tight spaces (badges), e.g. "12 Agu". */
export const formatEventShortDate = (iso) =>
  iso
    ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(new Date(iso))
    : null
