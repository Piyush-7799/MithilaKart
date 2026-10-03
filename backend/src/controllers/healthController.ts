/**
 * src/controllers/healthController.ts
 */

import type { RequestHandler } from "express";
import { checkDatabaseConnection } from "../services/healthService.js";

/** GET /api/health — basic liveness check */
export const getHealth: RequestHandler = (_req, res) => {
  res.json({
    status: "ok",
    service: "mithilakart-api",
    timestamp: new Date().toISOString(),
  });
};

/**
 * GET /api/health/db — actual PostgreSQL connectivity check.
 * Returns "connected" ONLY when Prisma successfully queries the database.
 */
export const getDbHealth: RequestHandler = async (_req, res) => {
  const isConnected = await checkDatabaseConnection();

  if (isConnected) {
    res.json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } else {
    res.status(503).json({
      status: "error",
      database: "unavailable",
      timestamp: new Date().toISOString(),
      message:
        "Could not reach the PostgreSQL database. " +
        "Ensure DATABASE_URL is set and the server is running.",
    });
  }
};
