import api from './axios'
import type { StockQuote, StockHistory } from '../types'

export const stocksApi = {
  getQuote: async (symbol: string): Promise<StockQuote> => {
    const { data } = await api.get(`/stocks/${symbol}`)
    return data
  },
  getHistory: async (symbol: string, range = '1mo'): Promise<StockHistory[]> => {
    const { data } = await api.get(`/stocks/${symbol}/history`, { params: { range } })
    return data
  },
}