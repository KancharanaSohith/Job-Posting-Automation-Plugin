import type { Express, Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation failed",
      details: err.flatten(),
    });
    return;
  }

  if (err instanceof Error) {
    const status = err.message.includes("not found")
      ? 404
      : err.message.includes("Only the owner") ||
          err.message.includes("Invalid state") ||
          err.message.includes("Cannot")
        ? 403
        : 400;
    res.status(status).json({ error: err.message });
    return;
  }

  res.status(500).json({ error: "Internal server error" });
}
