'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'
import { useAuth } from '../../context/auth'

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

/** "Masuk dengan Google" button rendered via Google Identity Services. */
export default function GoogleSignInButton({ onError, onSuccess }) {
  const { loginWithGoogle } = useAuth()
  const buttonRef = useRef(null)
  // Google Identity Services may already be loaded from a previous page (client-side
  // navigation between /login and /daftar doesn't reinsert the <script>, so Next's
  // Script `onLoad` — which only fires once per script tag — won't fire again here).
  const [scriptReady, setScriptReady] = useState(
    () => typeof window !== 'undefined' && !!window.google?.accounts?.id,
  )

  useEffect(() => {
    if (!scriptReady || !CLIENT_ID || !window.google || !buttonRef.current) return

    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: async ({ credential }) => {
        try {
          const u = await loginWithGoogle(credential)
          onSuccess?.(u)
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
        onReady={() => setScriptReady(true)}
      />
      <div ref={buttonRef} className="google-signin-btn" />
    </>
  )
}
