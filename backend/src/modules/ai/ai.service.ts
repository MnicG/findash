import { prisma } from "../../config/prisma";
import aiClient from "../../utils/aiClient";
import { stocksService } from "../stocks/stocks.service";
import { Response } from "express";

export async function analyzePortfolio(clientId: string, userId: string) {
  const client = await prisma.client.findFirstOrThrow({
    where: { id: clientId, userId },
  });

  const positions = await prisma.position.findMany({ where: { clientId } });
  const transactions = await prisma.transaction.findMany({ where: { clientId } });

  const quotes = await Promise.all(positions.map((p) => stocksService.getQuote(p.symbol)));

  const { data } = await aiClient.post("/ai/portfolio/analyze", {
    client: {
      id: client.id,
      name: client.name,
      riskProfile: client.riskProfile,
      portfolio: positions,
      transactions,
    },
    quotes,
  });

  return data.result;
}

export async function rebalancePortfolio(clientId: string, userId: string) {
  const client = await prisma.client.findFirstOrThrow({
    where: { id: clientId, userId },
  });

  const positions = await prisma.position.findMany({ where: { clientId } });
  const transactions = await prisma.transaction.findMany({ where: { clientId } });
  const quotes = await Promise.all(positions.map((p) => stocksService.getQuote(p.symbol)));

  const { data } = await aiClient.post("/ai/portfolio/rebalance", {
    client: {
      id: client.id,
      name: client.name,
      riskProfile: client.riskProfile,
      portfolio: positions,
      transactions,
    },
    quotes,
  });

  return data.result;
}

export async function summarizeNews(articles: object[]) {
  const { data } = await aiClient.post("/ai/news/summarize", { articles });
  return data.result;
}

export async function newsImpact(clientId: string, userId: string, articles: object[]) {
  const client = await prisma.client.findFirstOrThrow({
    where: { id: clientId, userId },
  });

  const positions = await prisma.position.findMany({ where: { clientId } });
  const transactions = await prisma.transaction.findMany({ where: { clientId } });

  const { data } = await aiClient.post("/ai/news/impact", {
    articles,
    client: {
      id: client.id,
      name: client.name,
      riskProfile: client.riskProfile,
      portfolio: positions,
      transactions,
    },
  });

  return data.result;
}

export async function chatStream(
  messages: { role: string; content: string }[],
  res: Response,
  clientId?: string,
  userId?: string
) {
  let clientContext = undefined;

  if (clientId && userId) {
    const client = await prisma.client.findFirst({
      where: { id: clientId, userId },
    });
    if (client) {
      const positions = await prisma.position.findMany({ where: { clientId } });
      const transactions = await prisma.transaction.findMany({ where: { clientId } });
      clientContext = {
        id: client.id,
        name: client.name,
        riskProfile: client.riskProfile,
        portfolio: positions,
        transactions,
      };
    }
  }

  const response = await aiClient.post(
    "/ai/chat",
    { messages, client: clientContext },
    { responseType: "stream", timeout: 300000 }
  );

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("X-Accel-Buffering", "no");
  res.setHeader("Connection", "keep-alive");

  response.data.pipe(res);
}