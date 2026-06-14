// ───────────────────────────────────────────────────────────────────────────
// The six core services (Produk) offered by ECC-BTS.
// `accent` drives the gradient/accent color used by ServiceCard.
// `icon` references a key in src/data/icons.jsx.
// `image` points to a real photo in /public/images used on the Products page.
// ───────────────────────────────────────────────────────────────────────────

// Reusable image paths (kept here so swapping a single file affects all
// services that share it).
const IMG_PAPER = '/images/publikasi-artikel-ilmiah.jpg'
const IMG_DATA = '/images/struktur-data.jpg'

// Static demo price applied to every service: Rp 900.000.
const PRICE_IDR = 900000

const baseServices = [
  {
    id: 'turnitin',
    number: '01',
    title: 'Jasa Turnitin / Parafrase',
    tagline: 'Cek similarity & parafrase, akurat dan aman.',
    description:
      'Pastikan karya ilmiah Anda bebas plagiarisme. Kami melakukan pengecekan similarity menggunakan Turnitin dan parafrase manual yang tetap menjaga makna asli tulisan Anda.',
    points: [
      'Cek similarity resmi (Turnitin)',
      'Parafrase manual oleh editor',
      'Laporan hasil & sertifikat similarity',
      'Kerahasiaan dokumen terjamin',
    ],
    icon: 'FiCheckCircle',
    categoryId: 'integritas',
    accent: 'blue',
    image: IMG_PAPER,
    imageAlt:
      'Halaman jurnal ilmiah dengan tanda highlight oranye dan pena di atasnya',
  },
  {
    id: 'statistik',
    number: '02',
    title: 'Jasa Pengolahan Data Statistik',
    tagline: 'Analisis data akurat, hasil mudah dipahami.',
    description:
      'Olah dan analisis data penelitian Anda dengan metode yang tepat. Hasil disajikan secara ringkas dan mudah dipahami, lengkap dengan interpretasi.',
    points: [
      'SPSS, Eviews, SmartPLS, AMOS, dll',
      'Uji validitas, reliabilitas, & hipotesis',
      'Interpretasi hasil yang jelas',
      'Pendampingan revisi data',
    ],
    icon: 'FiBarChart2',
    categoryId: 'analisis',
    accent: 'green',
    image: IMG_DATA,
    imageAlt:
      'Diagram struktur data — antrian, linked list, stack, tree, dan graph',
  },
  {
    id: 'publikasi',
    number: '03',
    title: 'Jasa Publikasi Artikel Ilmiah',
    tagline: 'Publikasi di jurnal nasional dan internasional.',
    description:
      'Wujudkan publikasi Anda di jurnal nasional terakreditasi (SINTA) maupun internasional bereputasi (Scopus). Kami dampingi dari penyesuaian template hingga terbit.',
    points: [
      'Jurnal SINTA & Scopus',
      'Penyesuaian template & gaya selingkung',
      'Pendampingan submission s.d. terbit',
      'Pilihan jurnal sesuai bidang',
    ],
    icon: 'FiGlobe',
    categoryId: 'publikasi',
    accent: 'indigo',
    image: IMG_PAPER,
    imageAlt:
      'Halaman artikel jurnal yang sedang dalam proses penyuntingan',
  },
  {
    id: 'proofreading',
    number: '04',
    title: 'Jasa Proofreading / Penyuntingan Jurnal',
    tagline: 'Perbaikan bahasa, tata tulis, dan konsistensi.',
    description:
      'Tingkatkan kualitas tulisan Anda dengan penyuntingan menyeluruh: tata bahasa, ejaan, konsistensi istilah, hingga alur penyampaian yang lebih profesional.',
    points: [
      'Proofreading Bahasa Indonesia & Inggris',
      'Perbaikan tata tulis & ejaan',
      'Konsistensi istilah & sitasi',
      'Sertifikat proofreading',
    ],
    icon: 'FiEdit3',
    categoryId: 'integritas',
    accent: 'orange',
    image: IMG_PAPER,
    imageAlt:
      'Naskah jurnal yang ditandai dengan stabilo dan koreksi pena',
  },
  {
    id: 'media',
    number: '05',
    title: 'Jasa Pembuatan Media Interaktif',
    tagline: 'Media pembelajaran interaktif & menarik.',
    description:
      'Ciptakan media pembelajaran yang interaktif, modern, dan menarik — mulai dari presentasi animatif, video edukasi, hingga modul digital interaktif.',
    points: [
      'Presentasi & video edukasi animatif',
      'Modul & kuis interaktif',
      'Desain visual modern',
      'Sesuai kebutuhan kurikulum',
    ],
    icon: 'FiMonitor',
    categoryId: 'media',
    accent: 'cyan',
    image: IMG_DATA,
    imageAlt:
      'Visualisasi diagram pembelajaran interaktif berisi node dan keterangan',
  },
  {
    id: 'penerbitan',
    number: '06',
    title: 'Jasa Penerbitan Buku / Self Publishing',
    tagline: 'Terbitkan buku Anda dengan mudah & profesional.',
    description:
      'Dari naskah menjadi buku ber-ISBN. Kami bantu proses editing, layout, desain sampul, hingga pengurusan ISBN dan pencetakan secara profesional.',
    points: [
      'Pengurusan ISBN resmi',
      'Editing, layout & desain sampul',
      'Cetak & distribusi',
      'Pendampingan hingga terbit',
    ],
    icon: 'FiBookOpen',
    categoryId: 'publikasi',
    accent: 'red',
    image: IMG_PAPER,
    imageAlt:
      'Halaman naskah buku yang sedang dalam tahap akhir editorial',
  },
]

// Listing metadata (rating, jumlah ulasan, badge) — demo data for the
// marketplace-style product cards.
const META = {
  turnitin: { rating: 4.9, reviews: 320, badge: 'Terlaris' },
  statistik: { rating: 4.8, reviews: 210, badge: 'Populer' },
  publikasi: { rating: 5.0, reviews: 175, badge: 'Unggulan' },
  proofreading: { rating: 4.9, reviews: 264, badge: null },
  media: { rating: 4.7, reviews: 98, badge: 'Baru' },
  penerbitan: { rating: 4.9, reviews: 142, badge: null },
}

// Every service shares the same static demo price (Rp 900.000).
export const services = baseServices.map((s) => ({
  ...s,
  price: PRICE_IDR,
  ...META[s.id],
}))

export const getServiceById = (id) => services.find((s) => s.id === id)
