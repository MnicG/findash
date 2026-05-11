import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { ApiError } from "../utils/ApiError";

export const errorMiddleware: ErrorRequestHandler = (
  err,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ApiError) {
    const apiError = err as ApiError;
    res.status(apiError.statusCode).json({
      status: "error",
      message: apiError.message,
    });
    return;
  }

  console.error(err);

  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
};