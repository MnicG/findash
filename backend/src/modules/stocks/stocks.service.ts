import { httpClient } from "../../utils/httpClient";
import { ApiError } from "../../utils/ApiError";

export const stocksService = {
  async getQuote(symbol: string) {
    try {
      const response = await httpClient.get(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
        { params: { interval: "1d", range: "1d" } }
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
        changePercent: ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100,
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
    const rangeMap: Record<string, string> = {
      "1d": "1d",
      "1mo": "35d",
      "3mo": "3mo",
      "6mo": "6mo",
      "1y": "1y",
    }
    const actualRange = rangeMap[range] || range
    const interval = range === "1d" ? "5m" : "1d"
    const response = await httpClient.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
      { params: { interval, range: actualRange } }
    )
    const result = response.data.chart.result[0]
    if (!result) throw new ApiError(404, "Stock not found")
    const timestamps = result.timestamp
    const closes = result.indicators.quote[0].close
    return timestamps.map((ts: number, i: number) => ({
      date: range === "1d"
        ? new Date(ts * 1000).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
        : new Date(ts * 1000).toISOString().split("T")[0],
      close: closes[i],
    })).filter((d: { close: number }) => d.close !== null)
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError(502, "Failed to fetch stock history")
  }
},

  async search(query: string) {
  try {
    const response = await httpClient.get(
      `https://query1.finance.yahoo.com/v1/finance/search`,
      { params: { q: query, quotesCount: 8, newsCount: 0 } }
    );
    const quotes = response.data.quotes || [];
    return quotes
      .filter((q: any) => q.symbol)
      .map((q: any) => ({
        symbol: q.symbol,
        name: q.longname || q.shortname || q.dispSecIndTerm || q.symbol
      }));
  } catch (error) {
    throw new ApiError(502, "Failed to search stocks");
    }
  },
};