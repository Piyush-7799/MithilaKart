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
  let token: string | undefined;

  // Prefer cookie token
  if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
      const [key, ...v] = cookie.split('=');
      if (key && v.length) {
        acc[key.trim()] = decodeURIComponent(v.join('='));
      }
      return acc;
    }, {} as Record<string, string>);
    token = cookies['token'];
  }



  if (!token) {
    return next(createApiError("Unauthorized: Missing or invalid token", 401));
  }

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
