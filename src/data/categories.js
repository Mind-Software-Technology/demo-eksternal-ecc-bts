// ───────────────────────────────────────────────────────────────────────────
// Service categories (Kategori) — groups services by visitor intent.
// `serviceIds` references ids in services.js.
// ───────────────────────────────────────────────────────────────────────────

export const categories = [
  {
    id: 'integritas',
    title: 'Integritas & Kualitas Tulisan',
    desc: 'Pastikan karya Anda orisinal, rapi, dan layak terbit.',
    icon: 'FiShield',
    accent: 'blue',
    serviceIds: ['turnitin', 'proofreading'],
  },
  {
    id: 'analisis',
    title: 'Analisis & Riset Data',
    desc: 'Olah data penelitian dengan metode yang tepat dan akurat.',
    icon: 'FiTrendingUp',
    accent: 'green',
    serviceIds: ['statistik'],
  },
  {
    id: 'publikasi',
    title: 'Publikasi & Penerbitan',
    desc: 'Dari artikel jurnal hingga buku ber-ISBN, kami dampingi sampai terbit.',
    icon: 'FiGlobe',
    accent: 'indigo',
    serviceIds: ['publikasi', 'penerbitan'],
  },
  {
    id: 'media',
    title: 'Media & Pembelajaran',
    desc: 'Media pembelajaran interaktif yang modern dan menarik.',
    icon: 'FiMonitor',
    accent: 'cyan',
    serviceIds: ['media'],
  },
]
