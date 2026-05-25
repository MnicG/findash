import { httpClient } from "../../utils/httpClient";
import { ApiError } from "../../utils/ApiError";

const FMP = "https://financialmodelingprep.com/api/v3";

export const stocksService = {
  async getQuote(symbol: string) {
    const key = process.env.FMP_API_KEY;
    try {
      const { data } = await httpClient.get(`${FMP}/quote/${symbol}?apikey=${key}`);
      const q = data[0];
      if (!q) throw new ApiError(404, "Stock not found");
      return {
        symbol: q.symbol,
        name: q.name,
        price: q.price,
        previousClose: q.previousClose,
        change: q.change,
        changePercent: q.changesPercentage,
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
      const rangeMap: Record<string, number> = {
        "1d": 1, "1mo": 35, "3mo": 90, "6mo": 180, "1y": 365,
      };
      const days = rangeMap[range] || 35;

      if (range === "1d") {
        const { data } = await httpClient.get(
          `${FMP}/historical-chart/5min/${symbol}?apikey=${key}`
        );
        return (data || [])
          .slice(0, 80)
          .reverse()
          .map((d: any) => ({
            date: d.date.split(' ')[1].slice(0, 5),
            close: d.close,
          }));
      }

      const to = new Date().toISOString().split('T')[0];
      const from = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
      const { data } = await httpClient.get(
        `${FMP}/historical-price-full/${symbol}?from=${from}&to=${to}&apikey=${key}`
      );
      return (data.historical || [])
        .reverse()
        .map((d: any) => ({ date: d.date, close: d.close }));
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(502, "Failed to fetch stock history");
    }
  },

  async search(query: string) {
    const key = process.env.FMP_API_KEY;
    try {
      const { data } = await httpClient.get(
        `${FMP}/search?query=${query}&limit=8&apikey=${key}`
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