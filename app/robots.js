import { SITE_URL } from '../data/site'

/**
 * robots.txt — dihasilkan Next (app/robots.js), bukan file statis di public/,
 * supaya host-nya ikut SITE_URL dan tidak pernah ketinggalan saat domain ganti.
 *
 * Yang di-disallow adalah halaman yang butuh login atau tidak punya nilai
 * pencarian sama sekali. Ini bukan pengaman: halaman privat tetap dijaga
 * auth di backend — robots hanya mencegah Google memboroskan crawl budget dan
 * memunculkan halaman "Keranjang kosong" di hasil pencarian.
 */
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/bayar/',
        '/keranjang',
        '/riwayat-pembayaran',
        '/profil',
        '/login',
        '/daftar',
        '/verify-email',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
