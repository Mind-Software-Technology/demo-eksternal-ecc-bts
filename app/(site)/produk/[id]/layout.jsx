import { API_URL } from '../../../../data/site'

// Halaman detail paling sering jadi pintu masuk dari Google, jadi judul dan
// deskripsinya diambil dari API di sisi server — bukan dari document.title
// yang baru terpasang setelah JS jalan.
export const revalidate = 3600

export async function generateMetadata({ params }) {
  const { id } = await params
  try {
    const res = await fetch(`${API_URL}/api/services/${id}`, {
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return {}
    const s = await res.json()
    const description = s.description || s.tagline || undefined
    return {
      title: s.title,
      description,
      alternates: { canonical: `/produk/${s.slug || id}` },
      openGraph: {
        title: s.title,
        description,
        url: `/produk/${s.slug || id}`,
        images: s.image_url ? [{ url: s.image_url }] : undefined,
      },
    }
  } catch {
    // API mati tidak boleh menggagalkan render halaman — jatuh balik ke
    // metadata induk (/produk).
    return {}
  }
}

export default function ProdukDetailLayout({ children }) {
  return children
}
