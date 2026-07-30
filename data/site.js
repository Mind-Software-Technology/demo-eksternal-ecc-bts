// ───────────────────────────────────────────────────────────────────────────
// Central site / brand configuration (static demo data).
// Replace placeholder contact details with real ones before launch.
// ───────────────────────────────────────────────────────────────────────────

export const site = {
  brand: 'ECC',
  brandFull: 'Best To Solution',
  motto: ['Bersinergi', 'Berbagi', 'Berprestasi'],
  tagline: 'Solusi Tepat untuk Karya Ilmiah Berkualitas',
  valueWords: ['Profesional', 'Cepat', 'Terpercaya'],
  description:
    'ECC-BTS membantu mahasiswa, dosen, dan peneliti menghasilkan karya ilmiah yang berkualitas, kredibel, dan tepat waktu — mulai dari cek similarity hingga publikasi dan penerbitan buku.',

  // Contact fallback (used only before /api/site-config loads, or if it fails)
  whatsapp: '6282375342772', // international format for wa.me
  phoneDisplay: '0823-7534-2772',
  email: 'ecc.btspendidikan@gmail.com',
  website: 'www.websiteanda.com',
  address:
    'Jl. Pratu Satir, Ruko CCR 1, No.5, Kebun Kopi, RT. 024, Kode Pos 36138, Kel. Thehok, Kec. Jambi Selatan, Kota Jambi',
  hours: 'Senin – Sabtu, 08.00 – 21.00 WIB',

  socials: [
    { name: 'Instagram', icon: 'FaInstagram', url: '#' },
    { name: 'Facebook', icon: 'FaFacebookF', url: '#' },
    { name: 'TikTok', icon: 'FaTiktok', url: '#' },
    { name: 'YouTube', icon: 'FaYoutube', url: '#' },
  ],

  nav: [
    { label: 'Beranda', to: '/' },
    { label: 'Produk', to: '/produk' },
    { label: 'Kategori', to: '/kategori' },
    { label: 'Kegiatan', to: '/kegiatan' },
    { label: 'Tentang Kami', to: '/tentang' },
    { label: 'Kontak', to: '/kontak' },
  ],
}

// Pre-built WhatsApp deep link with a friendly default message.
export const waLink = (text) =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(
    text || 'Halo ECC-BTS, saya ingin bertanya tentang layanan Anda.',
  )}`

/**
 * Nav items to render, merging /api/site-config's `nav_items` (admin-managed
 * order/labels) with the static list above. Any page here that the backend
 * config doesn't know about yet (e.g. a newly added route) is appended
 * instead of disappearing — the config is additive, not a full replacement.
 */
export const getNavItems = (config) => {
  const fromConfig = config?.nav_items?.length
    ? config.nav_items.map((n) => ({ label: n.label, to: n.path }))
    : []
  if (!fromConfig.length) return site.nav
  const missing = site.nav.filter((item) => !fromConfig.some((c) => c.to === item.to))
  return [...fromConfig, ...missing]
}
