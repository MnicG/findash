import { httpClient } from "../../utils/httpClient";
import { ApiError } from "../../utils/ApiError";
import { env } from "../../config/env";

export const newsService = {
  async getNews(query: string = "finance", pageSize: number = 10) {
    try {
      const response = await httpClient.get(
        "https://newsapi.org/v2/everything",
        {
          params: {
            q: query,
            pageSize,
            sortBy: "publishedAt",
            language: "en",
            apiKey: env.NEWS_API_KEY,
          },
        }
      );

      return response.data.articles.map((article: any) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source.name,
        publishedAt: article.publishedAt,
        urlToImage: article.urlToImage,
      }));
    } catch (error) {
      throw new ApiError(502, "Failed to fetch news");
    }
  },

  async getTopFinanceNews() {
    try {
      const response = await httpClient.get(
        "https://newsapi.org/v2/top-headlines",
        {
          params: {
            category: "business",
            pageSize: 10,
            language: "en",
            apiKey: env.NEWS_API_KEY,
          },
        }
      );

      return response.data.articles.map((article: any) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source.name,
        publishedAt: article.publishedAt,
        urlToImage: article.urlToImage,
      }));
    } catch (error) {
      throw new ApiError(502, "Failed to fetch top news");
    }
  },
};