import { httpClient } from "../../utils/httpClient";
import { ApiError } from "../../utils/ApiError";

const FMP = "https://financialmodelingprep.com/stable";

export const stocksService = {
  async getQuote(symbol: string) {
    const key = process.env.FMP_API_KEY;
    try {
      const { data } = await httpClient.get(`${FMP}/quote?symbol=${symbol}&apikey=${key}`);
      const q = data[0];
      if (!q || q.price == null) throw new ApiError(404, "Stock not found");
      return {
    symbol: q.symbol,
    name: q.name,
    change: Number(q.change) || 0,
    changePercent: Number(q.changesPercentage) || 0,
    currency: q.currency || 'USD',
    exchange: q.exchange,
    
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(502, "Failed to fetch stock data");
    }
  },

  async getHistory(symbol: string, range: string = "1mo") {
    const key = process.env.FMP_API_KEY;
    try {
      if (range === "1d") {
        const { data } = await httpClient.get(
          `${FMP}/historical-chart/5min?symbol=${symbol}&apikey=${key}`
        );
        return (data || []).slice(0, 80).reverse().map((d: any) => ({
          date: d.date.split(' ')[1].slice(0, 5),
          close: d.close,
        }));
      }

      const rangeMap: Record<string, number> = {
        "1mo": 35, "3mo": 90, "6mo": 180, "1y": 365,
      };
      const days = rangeMap[range] || 35;
      const to = new Date().toISOString().split('T')[0];
      const from = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
      const { data } = await httpClient.get(
        `${FMP}/historical-price-eod/light?symbol=${symbol}&from=${from}&to=${to}&apikey=${key}`
      );
      return (data || []).reverse().map((d: any) => ({ date: d.date, close: d.close }));
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(502, "Failed to fetch stock history");
    }
  },

  async search(query: string) {
    const key = process.env.FMP_API_KEY;
    try {
      const { data } = await httpClient.get(
        `${FMP}/search-name?query=${query}&limit=8&apikey=${key}`
      );
      return (data || []).map((q: any) => ({
        symbol: q.symbol,
        name: q.name,
      }));
    } catch (error) {
      throw new ApiError(502, "Failed to search stocks");
    }
  },
};