import { Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { clientService } from "./client.service";
import { CreateClientInput, UpdateClientInput } from "./client.schema";

export const clientController = {
  getAll: asyncHandler(async (req: AuthRequest, res: Response) => {
    const clients = await clientService.getAll(req.userId!);
    res.json(clients);
  }),

  getById: asyncHandler(async (req: AuthRequest, res: Response) => {
  const client = await clientService.getById(req.params.id as string, req.userId!);
  res.json(client);
}),

  create: asyncHandler(async (req: AuthRequest, res: Response) => {
    const data: CreateClientInput = req.body;
    const client = await clientService.create(data, req.userId!);
    res.status(201).json(client);
  }),

  update: asyncHandler(async (req: AuthRequest, res: Response) => {
  const data: UpdateClientInput = req.body;
  const client = await clientService.update(req.params.id as string, data, req.userId!);
  res.json(client);
}),
  delete: asyncHandler(async (req: AuthRequest, res: Response) => {
  await clientService.delete(req.params.id as string, req.userId!);
  res.status(204).send();
}),
};