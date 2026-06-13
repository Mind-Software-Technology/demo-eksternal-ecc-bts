import { FiStar } from 'react-icons/fi'

const items = [
  'Cek Turnitin & Parafrase',
  'Olah Data Statistik',
  'Publikasi SINTA & Scopus',
  'Proofreading Jurnal',
  'Media Pembelajaran Interaktif',
  'Penerbitan Buku ber-ISBN',
  'Kerahasiaan Terjamin',
  'Tim Ahli Berpengalaman',
]

/** Infinite scrolling strip of keywords (duplicated for seamless loop). */
export default function Marquee() {
  const loop = [...items, ...items]
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        {loop.map((t, i) => (
          <span key={i}>
            <FiStar /> {t}
          </span>
        ))}
      </div>
    </div>
  )
}
