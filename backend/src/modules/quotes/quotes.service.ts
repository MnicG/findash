import { httpClient } from "../../utils/httpClient";
import { ApiError } from "../../utils/ApiError";

const FMP = "https://financialmodelingprep.com/api/v3";
const key = process.env.FMP_API_KEY;

export const quotesService = {
  async getRate(from: string, to: string) {
    try {
      const { data } = await httpClient.get(
        `${FMP}/fx/${from}${to}?apikey=${key}`
      );
      const q = data[0];
      if (!q) throw new ApiError(404, "Currency pair not found");
      return {
        from,
        to,
        rate: q.ask,
        previousClose: q.open,
        change: q.ask - q.open,
        changePercent: ((q.ask - q.open) / q.open) * 100,
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(502, "Failed to fetch exchange rate");
    }
  },
};