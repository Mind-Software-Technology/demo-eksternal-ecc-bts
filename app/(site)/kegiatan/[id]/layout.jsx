import { API_URL } from '../../../../data/site'

export const revalidate = 3600

export async function generateMetadata({ params }) {
  const { id } = await params
  try {
    const res = await fetch(`${API_URL}/api/events/${id}`, {
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return {}
    const e = await res.json()
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
  } catch {
    return {}
  }
}

export default function KegiatanDetailLayout({ children }) {
  return children
}
