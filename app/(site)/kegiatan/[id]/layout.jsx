import { notFound } from 'next/navigation'
import { API_URL } from '../../../../data/site'

export const revalidate = 3600

function fetchEvent(id) {
  return fetch(`${API_URL}/api/events/${id}`, {
    headers: { Accept: 'application/json' },
  }).catch(() => null)
}

export async function generateMetadata({ params }) {
  const { id } = await params
  const res = await fetchEvent(id)
  if (!res?.ok) return {}

  const e = await res.json().catch(() => null)
  if (!e) return {}

  const description = e.description || undefined
  return {
    title: e.title,
    description,
    alternates: { canonical: `/kegiatan/${id}` },
    openGraph: {
      title: e.title,
      description,
      url: `/kegiatan/${id}`,
      images: e.flyer_url ? [{ url: e.flyer_url }] : undefined,
    },
  }
}

export default async function KegiatanDetailLayout({ children, params }) {
  const { id } = await params
  // Lihat catatan lengkapnya di app/(site)/produk/[id]/layout.jsx: hanya 404
  // yang boleh jadi 404, dan penjaganya harus di layout supaya status HTTP-nya
  // ikut 404 — bukan di generateMetadata.
  if ((await fetchEvent(id))?.status === 404) notFound()

  return children
}
