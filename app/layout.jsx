import '../styles/index.css'
import { CartProvider } from '../context/CartContext'
import { AuthProvider } from '../context/AuthContext'
import { NotificationProvider } from '../context/NotificationContext'
import CartToast from '../components/ui/CartToast'
import NotificationToast from '../components/ui/NotificationToast'
import { SITE_URL } from '../data/site'

const DESCRIPTION =
  'ECC — Best To Solution. Solusi tepat untuk karya ilmiah berkualitas: Turnitin/parafrase, olah data statistik, publikasi jurnal, proofreading, media interaktif, dan penerbitan buku.'

export const metadata = {
  // metadataBase bikin semua URL relatif di bawah (canonical, og:image)
  // dirender jadi absolut — Google dan WhatsApp mengabaikan yang relatif.
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'ECC — Best To Solution',
    template: '%s — ECC',
  },
  description: DESCRIPTION,
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    siteName: 'ECC — Best To Solution',
    locale: 'id_ID',
    url: '/',
    title: 'ECC — Best To Solution',
    description: DESCRIPTION,
    images: [{ url: '/images/logo.png', width: 288, height: 192 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ECC — Best To Solution',
    description: DESCRIPTION,
  },
  // Verifikasi Google Search Console lewat meta tag. Isi kodenya dari
  // Search Console → Tambah properti → Awalan URL → tag HTML.
  // Kalau sudah pakai verifikasi DNS TXT, baris ini boleh dihapus.
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
}

// Mirrors --navy-900 from styles/base.css — meta[name=theme-color] can't
// reference a CSS custom property, so the hex is duplicated here by hand.
export const viewport = {
  themeColor: '#152149',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,600&family=Sora:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <NotificationProvider>
            <CartProvider>
              {children}
              <CartToast />
              <NotificationToast />
            </CartProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
