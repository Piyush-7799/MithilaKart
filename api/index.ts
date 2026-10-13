/**
 * api/index.ts
 *
 * Vercel Serverless Function entry point for MithilaKart backend.
 * Reconstructs the original request path and query parameters forwarded
 * by Vercel rewrites before delegating to the Express application.
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import { createApp } from "../backend/src/app.js";
import { validateEnv } from "../backend/src/config/env.js";

// Validate required environment variables during serverless cold start
validateEnv();

const app = createApp();

/**
 * Serverless request handler wrapping Express.
 * Reconstructs the original `/api/...` URL from the `__path` query parameter
 * forwarded by Vercel before Express route matching occurs.
 */
export default function handler(req: IncomingMessage, res: ServerResponse): void {
  if (req.url) {
    try {
      const url = new URL(req.url, "http://localhost");
      const subpath = url.searchParams.get("__path");
      if (subpath !== null) {
        url.searchParams.delete("__path");
        const remainingSearch = url.searchParams.toString();
        const queryPart = remainingSearch ? `?${remainingSearch}` : "";
        const cleanSubpath = subpath
          ? subpath.startsWith("/")
            ? subpath
            : `/${subpath}`
          : "";
        req.url = `/api${cleanSubpath === "/" ? "" : cleanSubpath}${queryPart}`;
      }
    } catch {
      // If URL parsing fails, pass req as-is to Express
    }
  }

  return app(req, res);
}

export { app };
