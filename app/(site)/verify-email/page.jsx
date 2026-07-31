'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { FiCheckCircle, FiXCircle } from 'react-icons/fi'
import Page from '../../../components/layout/Page'
import PageHero from '../../../components/sections/PageHero'

function VerifyEmailContent() {
  const params = useSearchParams()
  const success = params.get('status') === 'success'

  return (
    <div className="container" style={{ padding: 'clamp(3rem, 2rem + 4vw, 5rem) 0', textAlign: 'center' }}>
      <div style={{ maxWidth: 440, margin: '0 auto' }}>
        {success ? (
          <>
            <FiCheckCircle style={{ fontSize: '3.2rem', color: 'var(--green)' }} />
            <h2 style={{ margin: '1rem 0 0.5rem' }}>Email berhasil diverifikasi</h2>
            <p style={{ color: 'var(--muted)' }}>
              Terima kasih, akun Anda sudah terverifikasi. Sekarang Anda dapat menikmati seluruh
              layanan ECC.
            </p>
          </>
        ) : (
          <>
            <FiXCircle style={{ fontSize: '3.2rem', color: 'var(--color-danger)' }} />
            <h2 style={{ margin: '1rem 0 0.5rem' }}>Verifikasi belum berhasil</h2>
            <p style={{ color: 'var(--muted)' }}>
              Link verifikasi tidak valid atau sudah kedaluwarsa. Silakan masuk ke akun Anda dan
              minta link verifikasi baru.
            </p>
          </>
        )}
        <Link href="/" className="btn btn--primary" style={{ marginTop: '1.5rem' }}>
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Page title="Verifikasi Email — ECC">
      <PageHero title="Verifikasi Email" crumb="Verifikasi Email" />
      <Suspense fallback={null}>
        <VerifyEmailContent />
      </Suspense>
    </Page>
  )
}
