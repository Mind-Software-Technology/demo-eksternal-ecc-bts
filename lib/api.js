// ───────────────────────────────────────────────────────────────────────────
// Thin fetch client for the Laravel backend (api-ecc-bts). Handles:
//  - credentials:'include' on every call (Sanctum SPA cookie session)
//  - the Sanctum CSRF-cookie dance on every mutating request — EnsureFrontendRequestsAreStateful
//    is prepended to the whole `api` middleware group, so ALL POST/PUT/PATCH/DELETE
//    calls (not just auth) are subject to CSRF verification once the origin is
//    recognized as stateful, even fully public ones like guest cart mutations.
//  - the guest cart X-Session-Id header (server-assigned, persisted locally)
//  - unwrapping {error:{code,message}} into thrown Error(message) w/ .status
// ───────────────────────────────────────────────────────────────────────────

// Trailing slash stripped defensively — every call below appends a path that
// already starts with "/", so a trailing slash here would silently double up
// and 404 (this broke every endpoint in production once already).
const BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'https://darkblue-ram-295886.hostingersite.com'
).replace(/\/+$/, '')
const SESSION_ID_KEY = 'ecc-bts-session-id'

function getStoredSessionId() {
  try {
    return localStorage.getItem(SESSION_ID_KEY)
  } catch {
    return null
  }
}

function storeSessionId(id) {
  try {
    localStorage.setItem(SESSION_ID_KEY, id)
  } catch {
    /* storage unavailable — ignore */
  }
}

function readCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

async function ensureCsrfCookie() {
  await fetch(`${BASE_URL}/sanctum/csrf-cookie`, { credentials: 'include' })
}

async function request(
  path,
  { method = 'GET', body, withSession = false } = {},
) {
  const needsCsrf = method !== 'GET'
  if (needsCsrf) await ensureCsrfCookie()

  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (needsCsrf) {
    const token = readCookie('XSRF-TOKEN')
    if (token) headers['X-XSRF-TOKEN'] = token
  }
  if (withSession) {
    const sid = getStoredSessionId()
    if (sid) headers['X-Session-Id'] = sid
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (withSession) {
    const newSid = res.headers.get('X-Session-Id')
    if (newSid) storeSessionId(newSid)
  }

  const contentType = res.headers.get('content-type') || ''
  const data = contentType.includes('application/json')
    ? await res.json().catch(() => null)
    : null

  if (!res.ok) {
    const message =
      data?.error?.message ||
      (res.status === 429
        ? 'Terlalu banyak permintaan. Coba lagi sebentar lagi.'
        : 'Terjadi kesalahan. Coba lagi.')
    const err = new Error(message)
    err.status = res.status
    throw err
  }

  return data
}

const unwrapList = (data) => data?.data ?? []
const unwrapPage = (data) => ({ items: data?.data ?? [], meta: data?.meta ?? null })

function toQueryString(params = {}) {
  const usp = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') usp.set(key, value)
  }
  const qs = usp.toString()
  return qs ? `?${qs}` : ''
}

export const api = {
  categories: {
    list: () => request('/api/categories').then(unwrapList),
    show: (slug) => request(`/api/categories/${slug}`),
  },
  services: {
    list: (params) => request(`/api/services${toQueryString(params)}`).then(unwrapPage),
    show: (slug) => request(`/api/services/${slug}`),
  },
  testimonials: {
    list: () => request('/api/testimonials').then(unwrapList),
  },
  faqs: {
    list: () => request('/api/faqs').then(unwrapList),
  },
  stats: {
    list: () => request('/api/stats').then(unwrapList),
  },
  aboutStats: {
    show: () => request('/api/about-stats').then((d) => d?.data ?? d),
  },
  advantages: {
    list: () => request('/api/advantages').then(unwrapList),
  },
  processSteps: {
    list: () => request('/api/process-steps').then(unwrapList),
  },
  siteConfig: {
    show: () => request('/api/site-config'),
  },
  events: {
    list: (params) => request(`/api/events${toQueryString(params)}`).then(unwrapList),
  },
  contact: {
    send: (payload) => request('/api/contact', { method: 'POST', body: payload }),
  },
  cart: {
    show: () => request('/api/cart', { withSession: true }),
    clear: () => request('/api/cart', { method: 'DELETE', withSession: true }),
    addItem: (serviceId, qty = 1) =>
      request('/api/cart/items', {
        method: 'POST',
        body: { service_id: serviceId, qty },
        withSession: true,
      }),
    updateItem: (id, qty) =>
      request(`/api/cart/items/${id}`, { method: 'PATCH', body: { qty }, withSession: true }),
    removeItem: (id) =>
      request(`/api/cart/items/${id}`, { method: 'DELETE', withSession: true }),
  },
  orders: {
    create: (payload) =>
      request('/api/orders', { method: 'POST', body: payload, withSession: true }),
    show: (orderNo, email) =>
      request(`/api/orders/${orderNo}${toQueryString({ email })}`),
    list: (email) => request(`/api/orders${toQueryString({ email })}`).then(unwrapPage),
  },
  payments: {
    // Guest orders are only accessible with a matching ?email= query param
    // (Order::findAccessibleOrFail) — pass the guest_email used at checkout.
    charge: (payload, email) =>
      request(`/api/payments${toQueryString({ email })}`, { method: 'POST', body: payload }),
    status: (orderNo, email) =>
      request(`/api/payments/${orderNo}/status${toQueryString({ email })}`),
    cancel: (orderNo, email) =>
      request(`/api/payments/${orderNo}/cancel${toQueryString({ email })}`, { method: 'POST' }),
  },
  auth: {
    register: (payload) => request('/api/auth/register', { method: 'POST', body: payload }),
    login: (payload) => request('/api/auth/login', { method: 'POST', body: payload }),
    logout: () => request('/api/auth/logout', { method: 'POST' }),
    me: () => request('/api/auth/me'),
  },
}
