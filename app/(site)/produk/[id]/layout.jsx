import { notFound } from 'next/navigation'
import { API_URL } from '../../../../data/site'

// Halaman detail paling sering jadi pintu masuk dari Google, jadi judul dan
// deskripsinya diambil dari API di sisi server — bukan dari document.title
// yang baru terpasang setelah JS jalan.
export const revalidate = 3600

// Dipanggil dua kali di bawah (metadata + penjaga 404). Argumen fetch-nya
// identik, jadi Next menggabungkannya jadi satu permintaan ke API.
function fetchService(id) {
  // API mati tidak boleh menggagalkan render halaman — jatuh balik ke
  // metadata induk (/produk).
  return fetch(`${API_URL}/api/services/${id}`, {
    headers: { Accept: 'application/json' },
  }).catch(() => null)
}

export async function generateMetadata({ params }) {
  const { id } = await params
  const res = await fetchService(id)
  if (!res?.ok) return {}

  const s = await res.json().catch(() => null)
  if (!s) return {}

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
}

export default async function ProdukDetailLayout({ children, params }) {
  const { id } = await params

  // Produk yang sudah dihapus admin harus balas 404, bukan 200 berisi halaman
  // kosong: Google mencatat yang terakhir sebagai "Soft 404" dan URL lamanya
  // hidup terus di indeks.
  //
  // Penjaganya di komponen layout, bukan di generateMetadata — notFound() dari
  // sana memang merender halaman not-found, tapi status HTTP-nya tetap 200.
  //
  // Hanya 404 yang dihitung. Gangguan server sesaat (500, jaringan putus)
  // jangan sampai men-404-kan seluruh katalog di mata Google.
  if ((await fetchService(id))?.status === 404) notFound()

  return children
}
