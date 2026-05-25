import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { stocksApi } from '../api/stocks.api'
import { quotesApi } from '../api/quotes.api'
import { newsApi } from '../api/news.api'
import type { Client } from '../types'
import { clientsApi } from '../api/clients.api'
import type { Position } from '../types'

export const useClientPositions = (clientId: string) =>
  useQuery({
    queryKey: ['positions', clientId],
    queryFn: () => clientsApi.getPositions(clientId),
    enabled: !!clientId,
  })

export const useAddPosition = (clientId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Position, 'id' | 'createdAt' | 'clientId'>) =>
      clientsApi.addPosition(clientId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['positions', clientId] })
      qc.invalidateQueries({ queryKey: ['transactions', clientId] })
    },
  })
}

export const useRemovePosition = (clientId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (positionId: string) => clientsApi.removePosition(clientId, positionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['positions', clientId] }),
  })
}

export const useClientTransactions = (clientId: string) =>
  useQuery({
    queryKey: ['transactions', clientId],
    queryFn: () => clientsApi.getTransactions(clientId),
    enabled: !!clientId,
  })

export const useClients = () =>
  useQuery({ queryKey: ['clients'], queryFn: clientsApi.getAll })

export const useCreateClient = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Client>) => clientsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  })
}

export const useUpdateClient = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Client> }) =>
      clientsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  })
}

export const useDeleteClient = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => clientsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  })
}

export const useStockQuote = (symbol: string) =>
  useQuery({
    queryKey: ['stock', symbol],
    queryFn: async () => {
      try {
        return await stocksApi.getQuote(symbol)
      } catch {
        return null
      }
    },
    enabled: !!symbol,
  })
export const useExchangeRate = (from: string, to: string) =>
  useQuery({
    queryKey: ['rate', from, to],
    queryFn: async () => {
      try {
        return await quotesApi.getRate(from, to)
      } catch {
        return { from, to, rate: 0, previousClose: 0, change: 0, changePercent: 0 }
      }
    },
    enabled: !!from && !!to,
  })

export const useStockHistory = (symbol: string, range = '1mo') =>
  useQuery({
    queryKey: ['stock-history', symbol, range],
    queryFn: () => stocksApi.getHistory(symbol, range),
    enabled: !!symbol,
  })


export const useTopNews = () =>
  useQuery({ queryKey: ['news-top'], queryFn: newsApi.getTop })

export const useSearchNews = (q: string) =>
  useQuery({
    queryKey: ['news-search', q],
    queryFn: () => newsApi.search(q),
    enabled: !!q,
  })