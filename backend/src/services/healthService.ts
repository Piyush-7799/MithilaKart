/**
 * src/services/healthService.ts
 * Performs an actual database connectivity check via Prisma.
 */

import { prisma } from "../lib/prisma.js";

export type DbStatus = "connected" | "unavailable";

export interface HealthStatus {
  status: "ok" | "error";
  service: string;
  database: DbStatus;
  timestamp: string;
}

/**
 * Runs a lightweight Prisma query ($queryRaw SELECT 1) to verify the
 * PostgreSQL connection. Returns true if the database responds.
 *
 * This intentionally does NOT throw — callers receive a boolean so the
 * health endpoint can report degraded status without crashing.
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error: unknown) {
    const errorName = error instanceof Error ? error.name : typeof error;
    const errorCode =
      error && typeof error === "object" && "code" in error && typeof (error as { code?: unknown }).code === "string"
        ? (error as { code: string }).code
        : undefined;

    if (errorCode) {
      console.error(`[HealthCheck] Database connection check failed: [${errorName}] code=${errorCode}`);
    } else {
      console.error(`[HealthCheck] Database connection check failed: [${errorName}]`);
    }

    return false;
  }
}
