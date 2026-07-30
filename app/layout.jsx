import '../styles/index.css'
import { CartProvider } from '../context/CartContext'
import { AuthProvider } from '../context/AuthContext'
import CartToast from '../components/ui/CartToast'

export const metadata = {
  title: 'ECC — Best To Solution',
  description:
    'ECC — Best To Solution. Solusi tepat untuk karya ilmiah berkualitas: Turnitin/parafrase, olah data statistik, publikasi jurnal, proofreading, media interaktif, dan penerbitan buku.',
  icons: {
    icon: '/favicon.svg',
  },
}

export const viewport = {
  themeColor: '#06205c',
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
          <CartProvider>
            {children}
            <CartToast />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
