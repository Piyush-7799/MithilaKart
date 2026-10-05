/**
 * src/controllers/orderController.ts
 */

import type { RequestHandler } from "express";
import { listOrders, getOrderById, createOrder as createOrderService } from "../services/orderService.js";
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

/** POST /api/orders — create a new order */
export const createOrder: RequestHandler = async (req, res, next) => {
  try {
    const { userId, address, items, paymentMethod, notes } = req.body;
    
    if (!address || !items || !Array.isArray(items) || items.length === 0) {
      return next(createApiError("Missing address or items", 400));
    }

    const order = await createOrderService({
      userId,
      address,
      items,
      paymentMethod,
      notes,
    });

    res.status(201).json({ status: "ok", order });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message.includes("Products not found") || err.message.includes("unavailable") || err.message.includes("Invalid quantity") || err.message.includes("at least one item"))) {
      return next(createApiError(err.message, 400));
    }
    next(err);
  }
};
