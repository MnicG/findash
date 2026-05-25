import axios from "axios";

export const quotesService = {
  async getRate(from: string, to: string) {
    try {
      const { data } = await axios.get(
        `https://api.exchangerate-api.com/v4/latest/${from}`
      );
      const rate = data.rates[to];
      if (!rate) return { from, to, rate: 0, previousClose: 0, change: 0, changePercent: 0 };
      return {
        from,
        to,
        rate,
        previousClose: rate,
        change: 0,
        changePercent: 0,
      };
    } catch (error) {
      return { from, to, rate: 0, previousClose: 0, change: 0, changePercent: 0 };
    }
  },
};