'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
import { unsubscribeFromPush } from '../lib/push'
import { AuthContext } from './auth'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    api.auth
      .me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setReady(true))
  }, [])

  const refresh = useCallback(async () => {
    try {
      const u = await api.auth.me()
      setUser(u)
      return u
    } catch {
      setUser(null)
      return null
    }
  }, [])

  const login = useCallback(async (payload) => {
    const u = await api.auth.login(payload)
    setUser(u)
    return u
  }, [])

  const register = useCallback(async (payload) => {
    const u = await api.auth.register(payload)
    setUser(u)
    return u
  }, [])

  const loginWithGoogle = useCallback(async (idToken) => {
    const u = await api.auth.google(idToken)
    setUser(u)
    return u
  }, [])

  const logout = useCallback(async () => {
    // Lepas langganan push selagi sesi masih hidup — setelah logout endpoint
    // DELETE-nya 401, dan langganan yatim itu berarti pemilik berikutnya
    // perangkat ini ikut menerima notifikasi pesanan akun lama.
    await unsubscribeFromPush()
    try {
      await api.auth.logout()
    } catch {
      // Session already gone server-side (expired/invalid cookie) — logging
      // out locally still succeeds, nothing left to revoke.
    } finally {
      setUser(null)
    }
  }, [])

  const resendVerification = useCallback(() => api.auth.resendVerification(), [])

  const updateProfile = useCallback(async (payload) => {
    const u = await api.auth.updateProfile(payload)
    setUser(u)
    return u
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        ready,
        login,
        register,
        loginWithGoogle,
        logout,
        refresh,
        resendVerification,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
