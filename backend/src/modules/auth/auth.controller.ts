import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { authService } from "./auth.service";
import { RegisterInput, LoginInput } from "./auth.schema";

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const data: RegisterInput = req.body;
    const result = await authService.register(data);
    res.status(201).json(result);
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const data: LoginInput = req.body;
    const result = await authService.login(data);
    res.status(200).json(result);
  }),
};