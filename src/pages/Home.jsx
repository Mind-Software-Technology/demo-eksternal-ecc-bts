import Page from '../components/layout/Page'
import Hero from '../components/sections/Hero'
import Marquee from '../components/sections/Marquee'
import CategoryBar from '../components/sections/CategoryBar'
import ServicesGrid from '../components/sections/ServicesGrid'
import WhyChooseUs from '../components/sections/WhyChooseUs'
import StatsBand from '../components/sections/StatsBand'
import ProcessSteps from '../components/sections/ProcessSteps'
import Testimonials from '../components/sections/Testimonials'
import CTABand from '../components/sections/CTABand'

export default function Home() {
  return (
    <Page title="ECC-BTS — Pusat Kolaborasi Pendidikan">
      <Hero />
      <Marquee />
      <CategoryBar />
      <ServicesGrid />
      <WhyChooseUs />
      <StatsBand />
      <ProcessSteps />
      <Testimonials />
      <CTABand />
    </Page>
  )
}
