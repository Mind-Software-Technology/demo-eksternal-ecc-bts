// ───────────────────────────────────────────────────────────────────────────
// Central site / brand configuration (static demo data).
// Replace placeholder contact details with real ones before launch.
// ───────────────────────────────────────────────────────────────────────────

export const site = {
  brand: 'ECC-BTS',
  brandFull: 'Pusat Kolaborasi Pendidikan',
  motto: ['Bersinergi', 'Berbagi', 'Berprestasi'],
  tagline: 'Solusi Tepat untuk Karya Ilmiah Berkualitas',
  valueWords: ['Profesional', 'Cepat', 'Terpercaya'],
  description:
    'ECC-BTS membantu mahasiswa, dosen, dan peneliti menghasilkan karya ilmiah yang berkualitas, kredibel, dan tepat waktu — mulai dari cek similarity hingga publikasi dan penerbitan buku.',

  // Contact (placeholder demo data)
  whatsapp: '6282212345678', // international format for wa.me
  phoneDisplay: '0822-1234-5678',
  email: 'ecc-bts@email.com',
  website: 'www.websiteanda.com',
  address: 'Jl. Pendidikan No. 17, Indonesia',
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
    { label: 'Tentang Kami', to: '/tentang' },
    { label: 'Kontak', to: '/kontak' },
  ],
}

// Pre-built WhatsApp deep link with a friendly default message.
export const waLink = (text) =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(
    text || 'Halo ECC-BTS, saya ingin bertanya tentang layanan Anda.',
  )}`
