import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { stocksApi } from '../api/stocks.api'
import { quotesApi } from '../api/quotes.api'
import { newsApi } from '../api/news.api'
import type { Client, Position } from '../types'
import { clientsApi } from '../api/clients.api'
import { aiApi } from '../api/ai.api'
import type { ChatMessage } from '../api/ai.api'
import { useState } from 'react'

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
      qc.invalidateQueries({ queryKey: ['clients-summary'] })
    },
  })
}

export const useRemovePosition = (clientId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (positionId: string) => clientsApi.removePosition(clientId, positionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['positions', clientId] })
      qc.invalidateQueries({ queryKey: ['clients-summary'] })
    },
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] })
      qc.invalidateQueries({ queryKey: ['clients-summary'] })
    },
  })
}

export const useUpdateClient = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Client> }) =>
      clientsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] })
      qc.invalidateQueries({ queryKey: ['clients-summary'] })
    },
  })
}

export const useDeleteClient = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => clientsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] })
      qc.invalidateQueries({ queryKey: ['clients-summary'] })
    },
  })
}

export const useStockQuote = (symbol: string) =>
  useQuery({
    queryKey: ['stock', symbol],
    queryFn: async () => {
      try { return await stocksApi.getQuote(symbol) } catch { return null }
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

  export const useAnalyzePortfolio = (clientId: string) =>
  useMutation({
    mutationFn: () => aiApi.analyzePortfolio(clientId),
  })

export const useRebalancePortfolio = (clientId: string) =>
  useMutation({
    mutationFn: () => aiApi.rebalancePortfolio(clientId),
  })

export const useSummarizeNews = () =>
  useMutation({
    mutationFn: (articles: object[]) => aiApi.summarizeNews(articles),
  })

export const useNewsImpact = (clientId: string) =>
  useMutation({
    mutationFn: (articles: object[]) => aiApi.newsImpact(clientId, articles),
  })

export const useChat = () => {
  const [isPending, setIsPending] = useState(false)

  const streamChat = async (
    messages: ChatMessage[],
    onChunk: (chunk: string) => void,
    onDone: () => void,
    clientId?: string
  ) => {
    setIsPending(true)
    const token = localStorage.getItem('token')
    const baseURL = import.meta.env.VITE_API_URL || '/api'

    const response = await fetch(`${baseURL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ messages, clientId }),
    })

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const text = decoder.decode(value)
      const lines = text.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') {
            onDone()
            setIsPending(false)
            return
          }
          try {
            const parsed = JSON.parse(data)
            if (parsed.chunk) onChunk(parsed.chunk)
          } catch { /* ignore malformed chunks */ }
        }
      }
    }
    setIsPending(false)
  }

  return { streamChat, isPending }
}

// Fetches all clients with positions, then live prices for all unique symbols
export const useDashboardSummary = () =>
  useQuery({
    queryKey: ['clients-summary'],
    queryFn: async () => {
      const clients = await clientsApi.getSummary()

      // Collect unique symbols across all clients
      const symbols = [...new Set(clients.flatMap(c => c.portfolio.map(p => p.symbol)))]

      // Fetch all live prices in parallel
      const results = await Promise.allSettled(symbols.map(s => stocksApi.getQuote(s)))
      const prices: Record<string, { price: number; changePercent: number }> = {}
      results.forEach((r, i) => {
        if (r.status === 'fulfilled' && r.value) {
          prices[symbols[i]] = { price: r.value.price, changePercent: r.value.changePercent }
        }
      })

      // Enrich each client
      const enriched = clients.map(client => {
        const totalCost = client.portfolio.reduce((s, p) => s + p.avgBuyPrice * p.quantity, 0)
        const totalValue = client.portfolio.reduce((s, p) => {
          const price = prices[p.symbol]?.price ?? p.avgBuyPrice
          return s + price * p.quantity
        }, 0)
        const gainPct = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0

        // Weighted daily change: sum(positionValue * changePercent) / totalValue
        const dailyChangePct = totalValue > 0
          ? client.portfolio.reduce((s, p) => {
              const price = prices[p.symbol]?.price ?? p.avgBuyPrice
              const weight = (price * p.quantity) / totalValue
              return s + (prices[p.symbol]?.changePercent ?? 0) * weight
            }, 0)
          : 0

        return {
          ...client,
          totalValue,
          totalCost,
          gainPct,
          dailyChangePct,
          positionCount: client.portfolio.length,
        }
      })

      const totalAUM = enriched.reduce((s, c) => s + c.totalValue, 0)
      const clientsUp = enriched.filter(c => c.dailyChangePct > 0).length
      const clientsDown = enriched.filter(c => c.dailyChangePct < 0).length

      const riskBreakdown = {
        conservative: clients.filter(c => c.riskProfile === 'conservative').length,
        moderate: clients.filter(c => !c.riskProfile || c.riskProfile === 'moderate').length,
        aggressive: clients.filter(c => c.riskProfile === 'aggressive').length,
      }

      return { clients: enriched, totalAUM, clientsUp, clientsDown, riskBreakdown }
    },
    refetchInterval: 60000,
  })