export const quotesApi = {
  async getRate(from: string, to: string) {
    const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`)
    const data = await res.json()
    const rate = data.rates[to]
    if (!rate) throw new Error('Rate not found')
    return {
      from,
      to,
      rate,
      previousClose: rate,
      change: 0,
      changePercent: 0,
    }
  }
}
