import type { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../services/authService.js";
import { createApiError } from "./errorHandler.js";

declare global {
// eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next(createApiError("Missing Authorization header", 401));
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return next(createApiError("Malformed Authorization header. Expected 'Bearer <token>'", 401));
  }

  const token = parts[1];
  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "TokenExpiredError") {
      return next(createApiError("Token expired", 401));
    }
    return next(createApiError("Invalid token", 401));
  }
};
