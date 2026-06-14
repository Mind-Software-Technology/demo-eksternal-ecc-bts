import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import ScrollToTop from './ScrollToTop'
import FloatingButtons from './FloatingButtons'
import CartToast from '../ui/CartToast'

/** Routes that render as a standalone, chrome-less page (e.g. checkout). */
const BARE_ROUTES = ['/bayar']

/** App shell: fixed navbar, page content, footer, and floating buttons.
 *  On "bare" routes the global chrome is hidden so the page stands on its own. */
export default function Layout({ children }) {
  const { pathname } = useLocation()
  const bare = BARE_ROUTES.includes(pathname)

  return (
    <>
      <ScrollToTop />
      {!bare && <Navbar />}
      <main>{children}</main>
      {!bare && <Footer />}
      {!bare && <FloatingButtons />}
      <CartToast />
    </>
  )
}
