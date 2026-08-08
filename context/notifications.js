'use client'

import { createContext, useContext } from 'react'

// Context object + consumer hook live here (no component exports) so the
// provider file can stay Fast-Refresh friendly.
export const NotificationContext = createContext(null)

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications harus dipakai di dalam <NotificationProvider>')
  return ctx
}
