/**
 * src/controllers/productController.ts
 */

import type { RequestHandler } from "express";
import { listProducts, getProductById } from "../services/productService.js";
import { createApiError } from "../middleware/errorHandler.js";

/** GET /api/products — list products with optional ?search, ?category, ?available */
export const getProducts: RequestHandler = async (req, res, next) => {
  try {
    const result = await listProducts({
      search: req.query["search"] as string | undefined,
      category: req.query["category"] as string | undefined,
      available: req.query["available"] as string | undefined,
      limit: req.query["limit"] as string | undefined,
      offset: req.query["offset"] as string | undefined,
    });

    res.json({
      status: "ok",
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

/** GET /api/products/:id — single product */
export const getProduct: RequestHandler = async (req, res, next) => {
  try {
    const product = await getProductById(String(req.params["id"] ?? ""));
    if (!product) {
      return next(createApiError(`Product not found: ${req.params["id"]}`, 404));
    }
    res.json({ status: "ok", product });
  } catch (err) {
    next(err);
  }
};
