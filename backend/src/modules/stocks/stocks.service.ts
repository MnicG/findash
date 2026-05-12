import { httpClient } from "../../utils/httpClient";
import { ApiError } from "../../utils/ApiError";

export const stocksService = {
  async getQuote(symbol: string) {
    try {
      const response = await httpClient.get(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
        {
          params: {
            interval: "1d",
            range: "1d",
          },
        }
      );

      const result = response.data.chart.result[0];
      if (!result) throw new ApiError(404, "Stock not found");

      const meta = result.meta;

      return {
        symbol: meta.symbol,
        name: meta.longName || meta.shortName,
        price: meta.regularMarketPrice,
        previousClose: meta.chartPreviousClose,
        change: meta.regularMarketPrice - meta.chartPreviousClose,
        changePercent:
          ((meta.regularMarketPrice - meta.chartPreviousClose) /
            meta.chartPreviousClose) *
          100,
        currency: meta.currency,
        exchange: meta.exchangeName,
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(502, "Failed to fetch stock data");
    }
  },

  async getHistory(symbol: string, range: string = "1mo") {
    try {
      const response = await httpClient.get(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
        {
          params: {
            interval: "1d",
            range,
          },
        }
      );

      const result = response.data.chart.result[0];
      if (!result) throw new ApiError(404, "Stock not found");

      const timestamps = result.timestamp;
      const closes = result.indicators.quote[0].close;

      return timestamps.map((ts: number, i: number) => ({
        date: new Date(ts * 1000).toISOString().split("T")[0],
        close: closes[i],
      }));
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(502, "Failed to fetch stock history");
    }
  },
};