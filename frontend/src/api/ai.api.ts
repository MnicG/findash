import api from './axios'

export type ChatMessage = { role: 'user' | 'assistant'; content: string }

export const aiApi = {
  analyzePortfolio: (clientId: string) =>
    api.post(`/ai/portfolio/${clientId}/analyze`, {}, { timeout: 300000 }).then(r => r.data.result as string),

  rebalancePortfolio: (clientId: string) =>
    api.post(`/ai/portfolio/${clientId}/rebalance`, {}, { timeout: 300000 }).then(r => r.data.result as string),

  summarizeNews: (articles: object[]) =>
    api.post('/ai/news/summarize', { articles }, { timeout: 300000 }).then(r => r.data.result as string),

  newsImpact: (clientId: string, articles: object[]) =>
    api.post(`/ai/news/impact/${clientId}`, { articles }, { timeout: 300000 }).then(r => r.data.result as string),
}