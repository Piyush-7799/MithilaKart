import rateLimit from "express-rate-limit";
import type { Request, Response } from "express";

// Use a consistent error response format
const handler = (req: Request, res: Response) => {
  res.status(429).json({
    status: "error",
    message: "Too many requests, please try again later.",
  });
};

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // limit each IP to 20 login/register requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      status: "error",
      message: "Too many authentication attempts, please try again later.",
    });
  },
});
