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
    const client = await prisma.client.findFirst({
      where: { id, userId },
    });
    if (!client) throw new ApiError(404, "Client not found");
    return client;
  },

  async create(data: CreateClientInput, userId: string) {
    return prisma.client.create({
      data: { ...data, userId },
    });
  },

  async update(id: string, data: UpdateClientInput, userId: string) {
    await clientService.getById(id, userId);
    return prisma.client.update({
      where: { id },
      data,
    });
  },

  async delete(id: string, userId: string) {
    await clientService.getById(id, userId);
    await prisma.client.delete({ where: { id } });
  },
};