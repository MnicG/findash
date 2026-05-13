import api from './axios'
import type { Client } from '../types'

export const clientsApi = {
  getAll: async (): Promise<Client[]> => {
    const { data } = await api.get('/clients')
    return data
  },
  create: async (payload: Partial<Client>): Promise<Client> => {
    const { data } = await api.post('/clients', payload)
    return data
  },
  update: async (id: string, payload: Partial<Client>): Promise<Client> => {
    const { data } = await api.put(`/clients/${id}`, payload)
    return data
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/clients/${id}`)
  },
}