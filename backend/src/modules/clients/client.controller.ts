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
    const client = await clientService.getById(req.params['id'] as string, req.userId!);
    res.json(client);
  }),

  create: asyncHandler(async (req: AuthRequest, res: Response) => {
    const client = await clientService.create(req.body as CreateClientInput, req.userId!);
    res.status(201).json(client);
  }),

  update: asyncHandler(async (req: AuthRequest, res: Response) => {
    const client = await clientService.update(req.params['id'] as string, req.body as UpdateClientInput, req.userId!);
    res.json(client);
  }),

  delete: asyncHandler(async (req: AuthRequest, res: Response) => {
    await clientService.delete(req.params['id'] as string, req.userId!);
    res.status(204).send();
  }),

  getPositions: asyncHandler(async (req: AuthRequest, res: Response) => {
    const positions = await clientService.getPositions(req.params['id'] as string, req.userId!);
    res.json(positions);
  }),

  addPosition: asyncHandler(async (req: AuthRequest, res: Response) => {
    const position = await clientService.addPosition(req.params['id'] as string, req.userId!, req.body);
    res.status(201).json(position);
  }),

  removePosition: asyncHandler(async (req: AuthRequest, res: Response) => {
    await clientService.removePosition(req.params['id'] as string, req.params['positionId'] as string, req.userId!);
    res.status(204).send();
  }),

  getTransactions: asyncHandler(async (req: AuthRequest, res: Response) => {
    const transactions = await clientService.getTransactions(req.params['id'] as string, req.userId!);
    res.json(transactions);
  }),

  getSummary: asyncHandler(async (req: AuthRequest, res: Response) => {
    const summary = await clientService.getSummary(req.userId!);
    res.json(summary);
  }),
};