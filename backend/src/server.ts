/**
 * src/server.ts
 * Entry point — starts the HTTP server with graceful shutdown handling.
 */

import "dotenv/config";
import { createApp } from "./app.js";
import { env, validateEnv } from "./config/env.js";
import { disconnectPrisma } from "./lib/prisma.js";

async function main() {
  // Validate required environment variables before doing anything else
  validateEnv();

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    console.log(`\n🚀 MithilaKart API running`);
    console.log(`   ► http://localhost:${env.PORT}/api/health`);
    console.log(`   ► http://localhost:${env.PORT}/api/health/db`);
    console.log(`   ► http://localhost:${env.PORT}/api/products`);
    console.log(`   Environment : ${env.NODE_ENV}`);
    console.log(`   CORS origin : ${env.CLIENT_URL}`);
    console.log(
      `   Database    : ${env.DATABASE_URL ? "configured (not yet connected)" : "⚠️  DATABASE_URL not set"}\n`
    );
  });

  // ── Graceful Shutdown ───────────────────────────────────────────────────────
  const shutdown = async (signal: string) => {
    console.log(`\n[Server] ${signal} received — shutting down…`);
    server.close(async () => {
      await disconnectPrisma();
      console.log("[Server] Graceful shutdown complete.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  // Handle unhandled promise rejections — log and exit cleanly
  process.on("unhandledRejection", (reason) => {
    console.error("[Server] Unhandled rejection:", reason);
    process.exit(1);
  });
}

main().catch((err) => {
  console.error("[Server] Fatal startup error:", err);
  process.exit(1);
});
