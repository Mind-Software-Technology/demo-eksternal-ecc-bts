// Halaman-halaman di sini semuanya 'use client' (butuh state/fetch), dan
// komponen client tidak boleh meng-export `metadata`. Layout server tipis ini
// jalan pintasnya: title/description tetap ada di HTML awal, bukan cuma
// dipasang document.title setelah JS jalan — yang sering terlewat crawler.
export const metadata = {
  // default+template, bukan string biasa. String biasa membatalkan template
  // '%s — ECC' dari root untuk semua halaman di bawahnya, sehingga judul
  // halaman detail kehilangan nama brand-nya — padahal halaman detail itulah
  // yang paling sering jadi hasil pencarian.
  title: { default: 'Produk & Layanan', template: '%s — ECC' },
  description:
    'Layanan lengkap untuk mendukung karya ilmiah Anda — cek Turnitin, parafrase, olah data statistik, publikasi jurnal, proofreading, hingga penerbitan buku.',
  alternates: { canonical: '/produk' },
}

export default function ProdukLayout({ children }) {
  return children
}
