import { prisma } from "../../config/prisma";
import aiClient from "../../utils/aiClient";
import { stocksService } from "../stocks/stocks.service";

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

export async function chat(
  messages: { role: string; content: string }[],
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

  const { data } = await aiClient.post("/ai/chat", {
    messages,
    client: clientContext,
  });

  return data.reply;
}