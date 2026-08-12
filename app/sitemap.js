import { SITE_URL, API_URL } from '../data/site'

// Sitemap dibangun ulang tiap jam, bukan hanya saat build — produk dan
// kegiatan baru yang admin tambahkan lewat panel harus muncul di sitemap
// tanpa perlu re-deploy Vercel.
export const revalidate = 3600

const STATIC_ROUTES = ['', '/produk', '/kategori', '/kegiatan', '/tentang', '/kontak']

// API mati / belum ter-deploy tidak boleh menggagalkan build — sitemap dengan
// halaman statis saja masih jauh lebih baik daripada tidak ada sitemap.
async function fetchList(path) {
  try {
    const res = await fetch(`${API_URL}${path}`, { headers: { Accept: 'application/json' } })
    if (!res.ok) return []
    const json = await res.json()
    return Array.isArray(json?.data) ? json.data : []
  } catch {
    return []
  }
}

export default async function sitemap() {
  const [services, events] = await Promise.all([
    fetchList('/api/services?limit=100'),
    fetchList('/api/events'),
  ])

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: `${SITE_URL}${route}`,
      changeFrequency: 'weekly',
      priority: route === '' ? 1 : 0.8,
    })),
    ...services.map((s) => ({
      url: `${SITE_URL}/produk/${s.slug}`,
      changeFrequency: 'weekly',
      priority: 0.7,
    })),
    ...events.map((e) => ({
      url: `${SITE_URL}/kegiatan/${e.id}`,
      changeFrequency: 'monthly',
      priority: 0.6,
    })),
  ]
}
