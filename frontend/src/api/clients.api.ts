import api from './axios'
import type { Client, Position, Transaction } from '../types'

export const clientsApi = {
  getAll: async (): Promise<Client[]> => {
    const { data } = await api.get('/clients')
    return data
  },
  getById: async (id: string): Promise<Client> => {
    const { data } = await api.get(`/clients/${id}`)
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
  getPositions: async (id: string): Promise<Position[]> => {
    const { data } = await api.get(`/clients/${id}/positions`)
    return data
  },
  addPosition: async (id: string, payload: Omit<Position, 'id' | 'createdAt' | 'clientId'>): Promise<Position> => {
    const { data } = await api.post(`/clients/${id}/positions`, payload)
    return data
  },
  removePosition: async (clientId: string, positionId: string): Promise<void> => {
    await api.delete(`/clients/${clientId}/positions/${positionId}`)
  },
  getTransactions: async (id: string): Promise<Transaction[]> => {
    const { data } = await api.get(`/clients/${id}/transactions`)
    return data
  },
}