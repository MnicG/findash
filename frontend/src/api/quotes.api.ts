import api from './axios'
import type { ExchangeRate } from '../types'

export const quotesApi = {
  getRate: async (from: string, to: string): Promise<ExchangeRate> => {
    const { data } = await api.get(`/quotes/${from}/${to}`)
    return data
  },
}