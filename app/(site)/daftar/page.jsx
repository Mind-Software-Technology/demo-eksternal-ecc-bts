'use client'

import { Suspense } from 'react'
import Page from '../../../components/layout/Page'
import AuthForm from '../../../components/layout/AuthForm'

export default function DaftarPage() {
  return (
    <Page title="Daftar Akun — ECC">
      <div className="container auth-page">
        <Suspense fallback={null}>
          <AuthForm mode="register" />
        </Suspense>
      </div>
    </Page>
  )
}
