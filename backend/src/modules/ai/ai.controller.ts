import { Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { AuthRequest } from "../../middlewares/auth.middleware";
import * as aiService from "./ai.service";

export const analyzePortfolio = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await aiService.analyzePortfolio(req.params.clientId as string, req.userId!);
  res.json({ result });
});

export const rebalancePortfolio = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await aiService.rebalancePortfolio(req.params.clientId as string, req.userId!);
  res.json({ result });
});

export const summarizeNews = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await aiService.summarizeNews(req.body.articles);
  res.json({ result });
});

export const newsImpact = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await aiService.newsImpact(req.params.clientId as string, req.userId!, req.body.articles);
  res.json({ result });
});

export const chat = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { messages, clientId } = req.body;
  await aiService.chatStream(messages, res, clientId, req.userId!);
});