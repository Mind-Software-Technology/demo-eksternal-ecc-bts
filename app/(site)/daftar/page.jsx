'use client'

import { Suspense } from 'react'
import Page from '../../../components/layout/Page'
import PageHero from '../../../components/sections/PageHero'
import AuthForm from '../../../components/layout/AuthForm'

export default function DaftarPage() {
  return (
    <Page title="Daftar Akun — ECC">
      <PageHero title="Buat Akun Baru" crumb="Daftar" />
      <div className="container auth-page">
        <Suspense fallback={null}>
          <AuthForm mode="register" />
        </Suspense>
      </div>
    </Page>
  )
}
