import { Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { newsService } from "./news.service";

export const newsController = {
  getNews: asyncHandler(async (req: AuthRequest, res: Response) => {
    const query = req.query.q as string;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 10;
    const news = await newsService.getNews(query, pageSize);
    res.json(news);
  }),

  getTopNews: asyncHandler(async (req: AuthRequest, res: Response) => {
    const news = await newsService.getTopFinanceNews();
    res.json(news);
  }),
};