/**
 * src/app.ts
 * Express application factory.
 * Sets up all middleware, routes, and error handlers.
 */

import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import { env } from "./config/env.js";
import { apiLimiter } from "./middleware/rateLimit.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";

import healthRoutes from "./routes/health.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import userRoutes from "./routes/users.js";
import addressRoutes from "./routes/addresses.js";

import authRoutes from "./routes/auth.js";

/**
 * Validates whether an incoming Origin header is trusted:
 * - Allows requests without an Origin header (same-origin GET/HEAD, server-to-server, CLI/curl)
 * - Allows explicitly configured CLIENT_URL
 * - Allows local development ports in development mode
 * - Allows exact Vercel deployment origin via VERCEL_URL (when valid)
 * - Allows exact Vercel Git branch preview origin via VERCEL_BRANCH_URL (when valid)
 * - Strictly rejects all other origins without regex or wildcard fallbacks
 */
export function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) {
    return true;
  }

  if (origin === env.CLIENT_URL) {
    return true;
  }

  if (env.isDev && (origin === "http://localhost:5173" || origin === "http://localhost:5174")) {
    return true;
  }

  const vercelUrl = process.env["VERCEL_URL"];
  if (typeof vercelUrl === "string" && vercelUrl.trim() !== "") {
    if (origin === `https://${vercelUrl.trim()}`) {
      return true;
    }
  }

  const vercelBranchUrl = process.env["VERCEL_BRANCH_URL"];
  if (typeof vercelBranchUrl === "string" && vercelBranchUrl.trim() !== "") {
    if (origin === `https://${vercelBranchUrl.trim()}`) {
      return true;
    }
  }

  return false;
}

export function createApp() {
  const app = express();

  if (env.isProd) {
    app.set("trust proxy", 1);
  }

  // ── Security & Parsing ─────────────────────────────────────────────────────

  // Use Helmet for secure HTTP headers
  app.use(helmet());

  // CORS: allow explicitly configured frontend origin, Vercel deployment URL, and project previews
  app.use(
    cors({
      origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
          callback(null, true);
        } else {
          // Reject untrusted browser origins without reflecting them in Access-Control-Allow-Origin
          callback(null, false);
        }
      },
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "x-idempotency-key"],
      credentials: true,
    })
  );

  // Reject state-changing requests carrying an untrusted Origin header
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && ["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
      if (!isAllowedOrigin(origin)) {
        return res.status(403).json({
          status: "error",
          message: "Forbidden: Origin not allowed",
        });
      }
    }
    next();
  });

  // Body parsing with a reasonable size limit
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));

  // ── Request Logging ────────────────────────────────────────────────────────
  if (env.isDev) {
    app.use(morgan("dev"));
  } else if (env.isProd) {
    app.use(morgan("combined"));
  }

  // ── Routes ─────────────────────────────────────────────────────────────────
  app.use("/api/health", healthRoutes);

  // Apply general rate limiting to all other API routes
  app.use("/api/", apiLimiter);

  app.use("/api/auth", authRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/addresses", addressRoutes);

  // ── 404 / Error Handlers ───────────────────────────────────────────────────
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
