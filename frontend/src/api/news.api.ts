import api from './axios'
import type { NewsArticle } from '../types'

export const newsApi = {
  getTop: async (): Promise<NewsArticle[]> => {
    const { data } = await api.get('/news/top')
    return data
  },
  search: async (q: string): Promise<NewsArticle[]> => {
    const { data } = await api.get('/news', { params: { q } })
    return data
  },
}