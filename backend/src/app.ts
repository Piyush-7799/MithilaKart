/**
 * src/app.ts
 * Express application factory.
 * Sets up all middleware, routes, and error handlers.
 */

import express from "express";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";

import healthRoutes from "./routes/health.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import userRoutes from "./routes/users.js";
import addressRoutes from "./routes/addresses.js";

export function createApp() {
  const app = express();

  // ── Security & Parsing ─────────────────────────────────────────────────────

  // CORS: only allow requests from the configured frontend origin
  app.use(
    cors({
      origin: env.CLIENT_URL,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );

  // Body parsing with a reasonable size limit
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));

  // ── Request Logging (dev only) ─────────────────────────────────────────────
  if (env.isDev) {
    app.use(morgan("dev"));
  }

  // ── Routes ─────────────────────────────────────────────────────────────────
  app.use("/api/health", healthRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/addresses", addressRoutes);

  // ── 404 / Error Handlers ───────────────────────────────────────────────────
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
