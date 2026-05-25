import { httpClient } from "../../utils/httpClient";
import { ApiError } from "../../utils/ApiError";

const FMP = "https://financialmodelingprep.com/stable";

export const quotesService = {
  async getRate(from: string, to: string) {
    const key = process.env.FMP_API_KEY;
    try {
      // FMP forex uses format like EURUSD, not USDBRL directly
      // Try the forex endpoint instead
      const { data } = await httpClient.get(
        `${FMP}/quote?symbol=${from}${to}&apikey=${key}`
      );
      console.log('FMP forex response:', JSON.stringify(data).slice(0, 200));
      const q = Array.isArray(data) ? data[0] : null;
      if (!q || q.price === undefined) {
        // Return a fallback so the app doesn't crash
        return { from, to, rate: 0, previousClose: 0, change: 0, changePercent: 0 };
      }
      return {
        from,
        to,
        rate: q.price ?? 0,
        previousClose: q.previousClose ?? 0,
        change: q.change ?? 0,
        changePercent: q.changesPercentage ?? 0,
      };
    } catch (error) {
      console.error('Forex error:', error);
      return { from, to, rate: 0, previousClose: 0, change: 0, changePercent: 0 };
    }
  },
};