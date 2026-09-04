export const metadata = {
  // default+template, bukan string biasa. String biasa membatalkan template
  // '%s — ECC' dari root untuk semua halaman di bawahnya, sehingga judul
  // halaman detail kehilangan nama brand-nya — padahal halaman detail itulah
  // yang paling sering jadi hasil pencarian.
  title: { default: 'Kegiatan & Acara', template: '%s — ECC' },
  description:
    'Ikuti workshop, webinar, dan agenda kolaborasi pendidikan dari ECC-BTS — kegiatan terbaru dan yang sudah berlalu.',
  alternates: { canonical: '/kegiatan' },
}

export default function KegiatanLayout({ children }) {
  return children
}
