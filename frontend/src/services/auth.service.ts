import type { User } from '@/types'
import { MOCK_USER } from '@/lib/mock'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  targetExam: string
}

export interface AuthResponse {
  token: string
  user: User
}

const delay = (ms = 600) => new Promise((r) => setTimeout(r, ms))

export const authService = {
  login: async (_payload: LoginPayload): Promise<AuthResponse> => {
    await delay()
    return { token: 'mock-token-123', user: MOCK_USER }
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    await delay()
    return {
      token: 'mock-token-123',
      user: { ...MOCK_USER, name: payload.name, email: payload.email, targetExam: payload.targetExam as User['targetExam'] },
    }
  },

  logout: async () => {
    await delay(200)
    localStorage.removeItem('token')
  },

  me: async (): Promise<User> => {
    await delay()
    return MOCK_USER
  },
}
