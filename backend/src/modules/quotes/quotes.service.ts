import axios from "axios";
import { ApiError } from "../../utils/ApiError";

const FMP = "https://financialmodelingprep.com/stable";

export const quotesService = {
  async getRate(from: string, to: string) {
    const key = process.env.FMP_API_KEY;
    try {
      const { data } = await axios.get(
        `${FMP}/quote?symbol=${from}${to}&apikey=${key}`
      );
      console.log('FMP forex response:', JSON.stringify(data).slice(0, 200));
      const q = Array.isArray(data) ? data[0] : null;
      if (!q || q.price === undefined) {
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
    } catch (error: any) {
      console.error('Forex error raw:', error?.response?.data);
      return { from, to, rate: 0, previousClose: 0, change: 0, changePercent: 0 };
    }
  },
};