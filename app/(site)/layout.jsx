import ScrollToTop from '../../components/layout/ScrollToTop'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import FloatingButtons from '../../components/layout/FloatingButtons'
import PageTransition from '../../components/layout/PageTransition'

/** Chrome shell (navbar/footer/floating buttons) for all "normal" pages. */
export default function SiteLayout({ children }) {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main>
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <FloatingButtons />
    </>
  )
}
