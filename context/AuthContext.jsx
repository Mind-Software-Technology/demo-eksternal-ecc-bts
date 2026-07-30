'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
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

  const logout = useCallback(async () => {
    try {
      await api.auth.logout()
    } finally {
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
