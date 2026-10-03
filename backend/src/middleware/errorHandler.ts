/**
 * src/middleware/errorHandler.ts
 * Centralised Express error handler.
 * Never exposes stack traces or internal messages in production.
 */

import type { ErrorRequestHandler } from "express";
import { env } from "../config/env.js";

export interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

/** Prisma error codes that indicate the DB is unreachable */
const PRISMA_CONNECTION_ERROR_CODES = new Set([
  "P1001", // Can't reach database server
  "P1002", // Database timed out
  "P1008", // Operations timed out
  "P1017", // Server closed the connection
]);

// Express error handlers MUST have 4 args (err, req, res, next) to be recognised.
// The 4th arg is intentionally unused — silence ESLint with a void cast.
export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  void next; // required by Express 4-arg error handler signature
  // Detect Prisma connection errors → return clean 503
  const errCode = (err as { code?: string }).code;
  const errName = (err as { name?: string }).name;
  const isPrismaConnectionError =
    (errCode && PRISMA_CONNECTION_ERROR_CODES.has(errCode)) ||
    errName === "PrismaClientInitializationError" ||
    (err.message && err.message.includes("Can't reach database server"));

  if (isPrismaConnectionError) {
    console.warn("[DB] Database unavailable:", err.message?.split("\n")[0]);
    res.status(503).json({
      status: "error",
      message: "Database unavailable. Please ensure PostgreSQL is running.",
      database: "unavailable",
    });
    return;
  }

  const statusCode = (err as ApiError).statusCode ?? 500;
  const isOperational = (err as ApiError).isOperational ?? false;

  // Always log server-side for 5xx
  if (statusCode >= 500) {
    console.error("[Error]", err);
  }

  // In production: hide internal details for 5xx errors
  if (env.isProd && statusCode >= 500 && !isOperational) {
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
    return;
  }

  res.status(statusCode).json({
    status: "error",
    message: err.message ?? "An unexpected error occurred",
    ...(env.isDev && statusCode >= 500 ? { stack: err.stack } : {}),
  });
};

/** Create a typed operational API error (safe to expose message to client) */
export function createApiError(message: string, statusCode = 400): ApiError {
  const error: ApiError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
}
