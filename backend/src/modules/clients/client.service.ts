import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { CreateClientInput, UpdateClientInput } from "./client.schema";

export const clientService = {
  async getAll(userId: string) {
    return prisma.client.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(id: string, userId: string) {
    const client = await prisma.client.findFirst({ where: { id, userId } });
    if (!client) throw new ApiError(404, "Client not found");
    return client;
  },

  async create(data: CreateClientInput, userId: string) {
    return prisma.client.create({ data: { ...data, userId } });
  },

  async update(id: string, data: UpdateClientInput, userId: string) {
    await this.getById(id, userId);
    return prisma.client.update({ where: { id }, data });
  },

  async delete(id: string, userId: string) {
    await this.getById(id, userId);
    await prisma.client.delete({ where: { id } });
  },

  async getPositions(clientId: string, userId: string) {
    await this.getById(clientId, userId);
    return prisma.position.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
    });
  },

  async addPosition(clientId: string, userId: string, data: {
    symbol: string; name: string; quantity: number; avgBuyPrice: number;
  }) {
    await this.getById(clientId, userId);
    const position = await prisma.position.create({
      data: { ...data, clientId },
    });
    await prisma.transaction.create({
      data: {
        symbol: data.symbol,
        name: data.name,
        type: "buy",
        quantity: data.quantity,
        price: data.avgBuyPrice,
        clientId,
      },
    });
    return position;
  },

  async removePosition(clientId: string, positionId: string, userId: string) {
    await this.getById(clientId, userId);
    await prisma.position.delete({ where: { id: positionId } });
  },

  async getTransactions(clientId: string, userId: string) {
    await this.getById(clientId, userId);
    return prisma.transaction.findMany({
      where: { clientId },
      orderBy: { date: "desc" },
    });
  },

  // Returns all clients with their positions in one query for the dashboard
  async getSummary(userId: string) {
    return prisma.client.findMany({
      where: { userId },
      include: {
        portfolio: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },
};