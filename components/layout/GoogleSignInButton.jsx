'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'
import { useAuth } from '../../context/auth'

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

/** "Masuk dengan Google" button rendered via Google Identity Services. */
export default function GoogleSignInButton({ onError, onSuccess }) {
  const { loginWithGoogle } = useAuth()
  const buttonRef = useRef(null)
  const [scriptReady, setScriptReady] = useState(false)

  useEffect(() => {
    if (!scriptReady || !CLIENT_ID || !window.google || !buttonRef.current) return

    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: async ({ credential }) => {
        try {
          await loginWithGoogle(credential)
          onSuccess?.()
        } catch (err) {
          onError?.(err.message || 'Login dengan Google gagal. Coba lagi.')
        }
      },
    })
    window.google.accounts.id.renderButton(buttonRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      width: '100%',
      text: 'continue_with',
      locale: 'id',
    })
  }, [scriptReady, loginWithGoogle, onError, onSuccess])

  if (!CLIENT_ID) return null

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />
      <div ref={buttonRef} className="google-signin-btn" />
    </>
  )
}
