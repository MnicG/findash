import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
    return;
  }

  console.error(err);

  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
};