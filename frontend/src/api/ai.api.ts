import api from './axios'

export type ChatMessage = { role: 'user' | 'assistant'; content: string }

export const aiApi = {
  analyzePortfolio: (clientId: string) =>
    api.post(`/ai/portfolio/${clientId}/analyze`).then(r => r.data.result as string),

  rebalancePortfolio: (clientId: string) =>
    api.post(`/ai/portfolio/${clientId}/rebalance`).then(r => r.data.result as string),

  summarizeNews: (articles: object[]) =>
    api.post('/ai/news/summarize', { articles }).then(r => r.data.result as string),

  newsImpact: (clientId: string, articles: object[]) =>
    api.post(`/ai/news/impact/${clientId}`, { articles }).then(r => r.data.result as string),

  chat: (messages: ChatMessage[], clientId?: string) =>
    api.post('/ai/chat', { messages, clientId }).then(r => r.data.reply as string),
}