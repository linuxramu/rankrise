import type { User } from '@/types'
import api from '@/lib/axios'

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

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await api.post<{ success: boolean; data: AuthResponse }>('/auth/login', payload)
    return response.data.data
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse & { verificationToken?: string }> => {
    const response = await api.post<{ success: boolean; data: AuthResponse & { verificationToken?: string } }>('/auth/register', payload)
    return response.data.data
  },

  logout: async () => {
    localStorage.removeItem('token')
  },

  me: async (): Promise<User> => {
    const response = await api.get<{ success: boolean; data: User }>('/auth/me')
    return response.data.data
  },
}
