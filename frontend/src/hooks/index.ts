import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clientsApi } from '../api/clients.api'
import { stocksApi } from '../api/stocks.api'
import { quotesApi } from '../api/quotes.api'
import { newsApi } from '../api/news.api'
import type { Client } from '../types'

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
    queryFn: () => stocksApi.getQuote(symbol),
    enabled: !!symbol,
  })

export const useStockHistory = (symbol: string, range = '1mo') =>
  useQuery({
    queryKey: ['stock-history', symbol, range],
    queryFn: () => stocksApi.getHistory(symbol, range),
    enabled: !!symbol,
  })

export const useExchangeRate = (from: string, to: string) =>
  useQuery({
    queryKey: ['rate', from, to],
    queryFn: () => quotesApi.getRate(from, to),
    enabled: !!from && !!to,
  })

export const useTopNews = () =>
  useQuery({ queryKey: ['news-top'], queryFn: newsApi.getTop })

export const useSearchNews = (q: string) =>
  useQuery({
    queryKey: ['news-search', q],
    queryFn: () => newsApi.search(q),
    enabled: !!q,
  })