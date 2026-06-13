import Navbar from './Navbar'
import Footer from './Footer'
import ScrollToTop from './ScrollToTop'
import FloatingButtons from './FloatingButtons'

/** App shell: fixed navbar, page content, footer, and floating buttons. */
export default function Layout({ children }) {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main>{children}</main>
      <Footer />
      <FloatingButtons />
    </>
  )
}
