'use client'

import { createContext, useContext } from 'react'

export const AuthContext = createContext(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus dipakai di dalam <AuthProvider>')
  return ctx
}

/** Login URL that returns to `path` after a successful sign-in (see AuthForm's ?redirect=). */
export const loginUrl = (path) => `/login?redirect=${encodeURIComponent(path)}`
