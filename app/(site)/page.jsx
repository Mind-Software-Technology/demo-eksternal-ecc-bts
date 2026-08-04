'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/auth'
import Page from '../../components/layout/Page'
import Hero from '../../components/sections/Hero'
import Marquee from '../../components/sections/Marquee'
import CategoryBar from '../../components/sections/CategoryBar'
import ServicesGrid from '../../components/sections/ServicesGrid'
import WhyChooseUs from '../../components/sections/WhyChooseUs'
import StatsBand from '../../components/sections/StatsBand'
import ProcessSteps from '../../components/sections/ProcessSteps'
import Testimonials from '../../components/sections/Testimonials'
import CTABand from '../../components/sections/CTABand'

export default function Home() {
  const { user, ready } = useAuth()
  const router = useRouter()

  // Sesi admin yang resume di beranda (buka tab baru, dsb) langsung
  // diarahkan ke dashboard admin — cuma di beranda, bukan seluruh halaman
  // publik, supaya admin tetap bisa browsing situs sebagai dirinya sendiri
  // kalau memang sengaja membuka halaman lain.
  useEffect(() => {
    if (ready && user?.role === 'admin') router.replace('/admin')
  }, [ready, user, router])

  return (
    <Page title="ECC — Best To Solution">
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
