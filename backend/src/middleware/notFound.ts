/**
 * src/middleware/notFound.ts
 * 404 catch-all for routes that don't exist.
 */

import type { RequestHandler } from "express";

export const notFound: RequestHandler = (req, res) => {
  res.status(404).json({
    status: "error",
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};
