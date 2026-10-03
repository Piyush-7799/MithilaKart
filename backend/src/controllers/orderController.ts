/**
 * src/controllers/orderController.ts
 */

import type { RequestHandler } from "express";
import { listOrders, getOrderById } from "../services/orderService.js";
import { createApiError } from "../middleware/errorHandler.js";

/** GET /api/orders — list orders with optional ?userId, ?status */
export const getOrders: RequestHandler = async (req, res, next) => {
  try {
    const result = await listOrders({
      userId: req.query["userId"] as string | undefined,
      status: req.query["status"] as string | undefined,
      limit: req.query["limit"] as string | undefined,
      offset: req.query["offset"] as string | undefined,
    });

    res.json({ status: "ok", ...result });
  } catch (err) {
    next(err);
  }
};

/** GET /api/orders/:id — single order with items */
export const getOrder: RequestHandler = async (req, res, next) => {
  try {
    const order = await getOrderById(String(req.params["id"] ?? ""));
    if (!order) {
      return next(createApiError(`Order not found: ${req.params["id"]}`, 404));
    }
    res.json({ status: "ok", order });
  } catch (err) {
    next(err);
  }
};
