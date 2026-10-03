/**
 * src/lib/prisma.ts
 * Singleton Prisma Client — prevents multiple connections in dev hot-reload.
 */

import { PrismaClient } from "@prisma/client";
import { env } from "../config/env.js";

declare global {
  // Needed for Prisma singleton hot-reload pattern in development
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: env.isDev ? ["query", "warn", "error"] : ["warn", "error"],
  });
}

// In development, reuse the client across hot-reloads to avoid connection
// pool exhaustion. In production, always use a fresh singleton.
export const prisma: PrismaClient = global.__prisma ?? createPrismaClient();

if (env.isDev) {
  global.__prisma = prisma;
}

/**
 * Gracefully disconnect Prisma when the process exits.
 */
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}
