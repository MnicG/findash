import { httpClient } from "../../utils/httpClient";
import { ApiError } from "../../utils/ApiError";

const YF = "https://query1.finance.yahoo.com";

const rangeToInterval: Record<string, string> = {
  "1d":  "5m",
  "1mo": "1d",
  "3mo": "1d",
  "6mo": "1wk",
  "1y":  "1wk",
};

export const stocksService = {
  async getQuote(symbol: string) {
    try {
      const { data } = await httpClient.get(
        `${YF}/v8/finance/chart/${symbol}?interval=1d&range=1d`,
        { headers: { "User-Agent": "Mozilla/5.0" } }
      );
      const result = data?.chart?.result?.[0];
      if (!result) throw new ApiError(404, "Stock not found");

      const meta = result.meta;
      const price = meta.regularMarketPrice;
      const previousClose = meta.chartPreviousClose ?? meta.previousClose ?? price;

      return {
        symbol:        meta.symbol,
        name:          meta.longName ?? meta.shortName ?? meta.symbol,
        price:         Number(price),
        previousClose: Number(previousClose),
        change:        Number((price - previousClose).toFixed(4)),
        changePercent: Number((((price - previousClose) / previousClose) * 100).toFixed(4)),
        currency:      meta.currency ?? "USD",
        exchange:      meta.exchangeName ?? "",
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(502, "Failed to fetch stock data");
    }
  },

  async getHistory(symbol: string, range: string = "1mo") {
    const interval = rangeToInterval[range] ?? "1d";
    try {
      const { data } = await httpClient.get(
        `${YF}/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`,
        { headers: { "User-Agent": "Mozilla/5.0" } }
      );
      const result = data?.chart?.result?.[0];
      if (!result) throw new ApiError(404, "Stock not found");

      const timestamps: number[] = result.timestamp ?? [];
      const closes: number[] = result.indicators?.quote?.[0]?.close ?? [];

      return timestamps
        .map((ts, i) => {
          const close = closes[i];
          if (close == null) return null;
          const d = new Date(ts * 1000);
          const date =
            range === "1d"
              ? d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
              : d.toISOString().split("T")[0];
          return { date, close: Number(close.toFixed(2)) };
        })
        .filter(Boolean);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(502, "Failed to fetch stock history");
    }
  },

  async search(query: string) {
    try {
      const { data } = await httpClient.get(
        `${YF}/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=8&newsCount=0`,
        { headers: { "User-Agent": "Mozilla/5.0" } }
      );
      return (data?.quotes ?? [])
        .filter((q: any) => q.symbol && q.quoteType !== "OPTION")
        .map((q: any) => ({
          symbol: q.symbol,
          name:   q.shortname ?? q.longname ?? q.symbol,
        }));
    } catch (error) {
      throw new ApiError(502, "Failed to search stocks");
    }
  },
};