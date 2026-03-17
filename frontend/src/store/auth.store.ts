import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import { authService, type LoginPayload, type RegisterPayload } from '@/services/auth.service'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (payload) => {
        const { token, user } = await authService.login(payload)
        localStorage.setItem('token', token)
        set({ user, token, isAuthenticated: true })
      },

      register: async (payload) => {
        const { token, user } = await authService.register(payload)
        localStorage.setItem('token', token)
        set({ user, token, isAuthenticated: true })
      },

      logout: async () => {
        await authService.logout()
        set({ user: null, token: null, isAuthenticated: false })
      },

      setUser: (user) => set({ user }),
    }),
    { name: 'auth-storage', partialize: (s) => ({ token: s.token, user: s.user }) }
  )
)
