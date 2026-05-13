export interface User {
  id: string
  name: string
  email: string
}

export interface Client {
  id: string
  name: string
  email: string
  phone?: string
  document?: string
  createdAt: string
  updatedAt: string
  userId: string
}

export interface StockQuote {
  symbol: string
  name: string
  price: number
  previousClose: number
  change: number
  changePercent: number
  currency: string
  exchange: string
}

export interface StockHistory {
  date: string
  close: number
}

export interface ExchangeRate {
  from: string
  to: string
  rate: number
  previousClose: number
  change: number
  changePercent: number
}

export interface NewsArticle {
  title: string
  description: string
  url: string
  source: string
  publishedAt: string
  urlToImage: string | null
}