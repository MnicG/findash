import api from './axios'
import type { User } from '../types'

interface AuthResponse {
  token: string
  user: User
}

export const authApi = {
  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/register', { name, email, password })
    return data
  },
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/login', { email, password })
    return data
  },
}