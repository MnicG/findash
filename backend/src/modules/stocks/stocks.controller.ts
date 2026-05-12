import { Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { stocksService } from "./stocks.service";

export const stocksController = {
  getQuote: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { symbol } = req.params;
    const quote = await stocksService.getQuote(symbol as string);
    res.json(quote);
  }),

  getHistory: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { symbol } = req.params;
    const { range } = req.query;
    const history = await stocksService.getHistory(
      symbol as string,
      range as string
    );
    res.json(history);
  }),
};