import ScrollToTop from '../../components/layout/ScrollToTop'
import PageTransition from '../../components/layout/PageTransition'

/** Chrome-less shell for the checkout page (no navbar/footer/floating buttons). */
export default function BayarLayout({ children }) {
  return (
    <>
      <ScrollToTop />
      <main>
        <PageTransition>{children}</PageTransition>
      </main>
    </>
  )
}
