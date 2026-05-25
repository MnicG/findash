import { httpClient } from "../../utils/httpClient";
import { ApiError } from "../../utils/ApiError";

const FMP = "https://financialmodelingprep.com/stable";

export const quotesService = {
  async getRate(from: string, to: string) {
    const key = process.env.FMP_API_KEY;
    try {
      const { data } = await httpClient.get(
        `${FMP}/quote?symbol=${from}${to}&apikey=${key}`
      );
      const q = data[0];
      if (!q) throw new ApiError(404, "Currency pair not found");
      return {
        from,
        to,
        rate: q.price,
        previousClose: q.previousClose,
        change: q.change,
        changePercent: q.changesPercentage,
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(502, "Failed to fetch exchange rate");
    }
  },
};