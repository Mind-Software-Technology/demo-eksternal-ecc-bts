// ───────────────────────────────────────────────────────────────────────────
// The six core services (Produk) offered by ECC-BTS.
// `accent` drives the gradient/accent color used by ServiceCard.
// `icon` references a key in src/data/icons.jsx.
// ───────────────────────────────────────────────────────────────────────────

export const services = [
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
  },
]

export const getServiceById = (id) => services.find((s) => s.id === id)
