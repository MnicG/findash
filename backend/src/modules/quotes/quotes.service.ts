import { httpClient } from "../../utils/httpClient";
import { ApiError } from "../../utils/ApiError";

export const quotesService = {
  async getRate(from: string, to: string) {
    try {
      const symbol = `${from}${to}=X`;
      const response = await httpClient.get(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
        { params: { interval: "1d", range: "1d" } }
      );

      const result = response.data.chart.result[0];
      if (!result) throw new ApiError(404, "Currency pair not found");

      const meta = result.meta;

      return {
        from,
        to,
        rate: meta.regularMarketPrice,
        previousClose: meta.chartPreviousClose,
        change: meta.regularMarketPrice - meta.chartPreviousClose,
        changePercent:
          ((meta.regularMarketPrice - meta.chartPreviousClose) /
            meta.chartPreviousClose) *
          100,
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(502, "Failed to fetch exchange rate");
    }
  },
};