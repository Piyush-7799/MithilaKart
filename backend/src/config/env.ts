/**
 * src/config/env.ts
 * Centralised environment variable access with validation.
 * Fails fast on missing required variables so problems are caught at startup.
 */

import "dotenv/config";

function requireEnv(key: string, fallback?: string): string {
  const val = process.env[key] ?? fallback;
  if (val === undefined || val === "") {
    throw new Error(`[Config] Missing required environment variable: ${key}`);
  }
  return val;
}

export const env = {
  /** TCP port the Express server listens on */
  PORT: parseInt(process.env["PORT"] ?? "4000", 10),

  /** Allowed CORS origin — must match Vite frontend URL */
  CLIENT_URL: process.env["CLIENT_URL"] ?? "http://localhost:5173",

  /** Runtime environment */
  NODE_ENV: (process.env["NODE_ENV"] ?? "development") as
    | "development"
    | "production"
    | "test",

  /** PostgreSQL connection string — required in production, optional in dev */
  DATABASE_URL: process.env["DATABASE_URL"],

  get isDev() {
    return this.NODE_ENV === "development";
  },
  get isProd() {
    return this.NODE_ENV === "production";
  },
} as const;

/**
 * Validate that DATABASE_URL is present. Called at startup so the server
 * won't start with a missing connection string in production.
 */
export function validateEnv(): void {
  if (env.isProd) {
    requireEnv("DATABASE_URL");
    requireEnv("CLIENT_URL");
  }
}
