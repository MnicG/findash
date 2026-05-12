import { Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { quotesService } from "./quotes.service";

export const quotesController = {
  getRate: asyncHandler(async (req: AuthRequest, res: Response) => {
    const from = req.params.from as string;
    const to = req.params.to as string;
    const rate = await quotesService.getRate(
      from.toUpperCase(),
      to.toUpperCase()
    );
    res.json(rate);
  }),
};