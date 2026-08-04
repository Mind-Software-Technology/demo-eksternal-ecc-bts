// ───────────────────────────────────────────────────────────────────────────
// Thin fetch client for the Laravel backend (api-ecc-bts). Handles:
//  - credentials:'include' on every call (Sanctum SPA cookie session)
//  - the Sanctum CSRF-cookie dance on every mutating request — EnsureFrontendRequestsAreStateful
//    is prepended to the whole `api` middleware group, so ALL POST/PUT/PATCH/DELETE
//    calls are subject to CSRF verification once the origin is recognized as stateful
//  - unwrapping {error:{code,message}} into thrown Error(message) w/ .status
// Cart/checkout/payments all require a logged-in session (no guest cart) —
// see routes/api.php's auth:sanctum group in the backend.
// ───────────────────────────────────────────────────────────────────────────
// Trailing slash stripped defensively — every call below appends a path that
// already starts with "/", so a trailing slash here would silently double up
// and 404 (this broke every endpoint in production once already).
const BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'https://api.ecc-bts.id'
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


async function handleResponse(res, { withSession = false } = {}) {
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

async function request(
  path,
  { method = 'GET', body, withSession = false } = {},
) {

  const needsCsrf = method !== 'GET'
  if (needsCsrf) await ensureCsrfCookie()

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData

  const headers = { Accept: 'application/json' }
  // Leave Content-Type unset for FormData — the browser fills in the
  // multipart boundary itself; setting it manually breaks the upload.
  if (body !== undefined && !isFormData) headers['Content-Type'] = 'application/json'
  if (needsCsrf) {
    const token = readCookie('XSRF-TOKEN')
    if (token) headers['X-XSRF-TOKEN'] = token
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
  })

  return handleResponse(res, { withSession })
}

// Laravel only populates $_FILES/$_POST for true POST requests — a PUT sent
// as multipart/form-data (needed for file uploads on update) never parses on
// the server. Standard workaround: POST with a `_method` override field, same
// trick Laravel's own Blade @method directive uses for HTML forms.
async function requestMultipart(path, method, data) {
  await ensureCsrfCookie()

  const fd = new FormData()
  if (method !== 'POST') fd.append('_method', method)
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue
    if (Array.isArray(value)) {
      value.forEach((v) => fd.append(`${key}[]`, v))
      continue
    }
    fd.append(key, typeof value === 'boolean' ? (value ? '1' : '0') : value)
  }

  const headers = { Accept: 'application/json' }
  const token = readCookie('XSRF-TOKEN')
  if (token) headers['X-XSRF-TOKEN'] = token

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: fd,
  })

  return handleResponse(res)
}

// Generic admin CRUD for the katalog/konten resources — they all share the
// same { index, store, update, destroy } shape at /api/admin/{resource}.
function adminCrud(resource, { multipart = false } = {}) {
  const base = `/api/admin/${resource}`
  return {
    list: () => request(base).then(unwrapList),
    create: (data) =>
      multipart ? requestMultipart(base, 'POST', data) : request(base, { method: 'POST', body: data }),
    update: (id, data) =>
      multipart
        ? requestMultipart(`${base}/${id}`, 'PUT', data)
        : request(`${base}/${id}`, { method: 'PUT', body: data }),
    remove: (id) => request(`${base}/${id}`, { method: 'DELETE' }),
  }
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
    show: () => request('/api/cart'),
    clear: () => request('/api/cart', { method: 'DELETE' }),
    addItem: (serviceId, qty = 1) =>
      request('/api/cart/items', { method: 'POST', body: { service_id: serviceId, qty } }),
    updateItem: (id, qty) =>
      request(`/api/cart/items/${id}`, { method: 'PATCH', body: { qty } }),
    removeItem: (id) => request(`/api/cart/items/${id}`, { method: 'DELETE' }),
  },
  orders: {
    // attachments: { [serviceId]: File } — optional per item, required only
    // when that item's service has requires_attachment=true. Sent as
    // attachments[serviceId] so the backend can match file <-> line item.
    create: (payload, attachments = {}) => {
      const form = new FormData()
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') form.append(key, value)
      })
      Object.entries(attachments).forEach(([serviceId, file]) => {
        if (file) form.append(`attachments[${serviceId}]`, file)
      })
      return request('/api/orders', { method: 'POST', body: form })
    },
    show: (orderNo) => request(`/api/orders/${orderNo}`),
    // Guest name/phone only — items/pricing stay immutable once an order exists.
    update: (orderNo, payload) => request(`/api/orders/${orderNo}`, { method: 'PATCH', body: payload }),
    list: () => request('/api/orders').then(unwrapPage),
    // Plain link (not a fetch call) — the browser's top-level GET navigation
    // still carries the Sanctum session cookie (SameSite=Lax allows that),
    // so an <a href> straight to this URL is enough to trigger the download.
    attachmentUrl: (orderNo, itemId) => `${BASE_URL}/api/orders/${orderNo}/items/${itemId}/attachment`,
    // Same plain-link pattern as attachmentUrl — the file admin delivers back once
    // an item (e.g. Turnitin check) is done being worked on.
    resultUrl: (orderNo, itemId) => `${BASE_URL}/api/orders/${orderNo}/items/${itemId}/result`,
  },
  payments: {
    charge: (payload) => request('/api/payments', { method: 'POST', body: payload }),
    status: (orderNo) => request(`/api/payments/${orderNo}/status`),
    cancel: (orderNo) => request(`/api/payments/${orderNo}/cancel`, { method: 'POST' }),
  },
  auth: {
    register: (payload) => request('/api/auth/register', { method: 'POST', body: payload }),
    login: (payload) => request('/api/auth/login', { method: 'POST', body: payload }),
    google: (idToken) =>
      request('/api/auth/google', { method: 'POST', body: { id_token: idToken } }),
    logout: () => request('/api/auth/logout', { method: 'POST' }),
    me: () => request('/api/auth/me'),
    updateProfile: (payload) => request('/api/auth/me', { method: 'PATCH', body: payload }),
    resendVerification: () =>
      request('/api/auth/email/verification-notification', { method: 'POST' }),
  },
  admin: {
    categories: adminCrud('categories'),
    services: adminCrud('services', { multipart: true }),
    testimonials: adminCrud('testimonials'),
    faqs: adminCrud('faqs'),
    advantages: adminCrud('advantages'),
    processSteps: adminCrud('process-steps'),
    events: adminCrud('events', { multipart: true }),
    siteConfig: {
      update: (payload) => request('/api/admin/site-config', { method: 'PUT', body: payload }),
    },
    orders: {
      list: (params) => request(`/api/admin/orders${toQueryString(params)}`).then(unwrapPage),
      show: (orderNo) => request(`/api/admin/orders/${orderNo}`),
      uploadResult: (orderNo, itemId, file) =>
        requestMultipart(`/api/admin/orders/${orderNo}/items/${itemId}/result`, 'POST', { result: file }),
      // Plain <a href> downloads — the browser sends the Sanctum session cookie
      // on top-level navigation same as any other same-site GET.
      attachmentUrl: (orderNo, itemId) => `${BASE_URL}/api/admin/orders/${orderNo}/items/${itemId}/attachment`,
      resultUrl: (orderNo, itemId) => `${BASE_URL}/api/admin/orders/${orderNo}/items/${itemId}/result`,
    },
    payments: {
      list: (params) => request(`/api/admin/payments${toQueryString(params)}`).then(unwrapPage),
      show: (id) => request(`/api/admin/payments/${id}`),
    },
    analytics: {
      revenue: () => request('/api/admin/analytics/revenue').then(unwrapList),
    },
    contactMessages: {
      list: (params) => request(`/api/admin/contact-messages${toQueryString(params)}`).then(unwrapPage),
      remove: (id) => request(`/api/admin/contact-messages/${id}`, { method: 'DELETE' }),
    },
  },
}
