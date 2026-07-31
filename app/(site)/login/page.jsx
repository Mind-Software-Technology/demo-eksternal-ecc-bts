'use client'

import { Suspense } from 'react'
import Page from '../../../components/layout/Page'
import PageHero from '../../../components/sections/PageHero'
import AuthForm from '../../../components/layout/AuthForm'

export default function LoginPage() {
  return (
    <Page title="Masuk — ECC">
      <PageHero title="Masuk ke Akun Anda" crumb="Masuk" />
      <div className="container auth-page">
        <Suspense fallback={null}>
          <AuthForm mode="login" />
        </Suspense>
      </div>
    </Page>
  )
}
