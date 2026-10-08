/**
 * src/controllers/orderController.ts
 */

import type { RequestHandler } from "express";
import type { OrderStatus } from "@prisma/client";
import { listOrders, getOrderById, createOrder as createOrderService, updateOrderStatus } from "../services/orderService.js";
import { createApiError } from "../middleware/errorHandler.js";

/** GET /api/orders — list orders with optional ?status */
export const getOrders: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(createApiError("Unauthorized", 401));
    }

    const result = await listOrders({
      userId,
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
    const userId = req.user?.id;
    if (!userId) {
      return next(createApiError("Unauthorized", 401));
    }

    const order = await getOrderById(String(req.params["id"] ?? ""));
    if (!order) {
      return next(createApiError(`Order not found: ${req.params["id"]}`, 404));
    }

    if (order.userId !== userId && req.user?.role !== "ADMIN") {
      return next(createApiError("Forbidden", 403));
    }

    res.json({ status: "ok", order });
  } catch (err) {
    next(err);
  }
};

/** POST /api/orders — create a new order */
export const createOrder: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(createApiError("Unauthorized", 401));
    }

    const idempotencyKey = req.headers["x-idempotency-key"] as string | undefined;
    if (!idempotencyKey || idempotencyKey.length < 10 || idempotencyKey.length > 100) {
      return next(createApiError("Missing or invalid X-Idempotency-Key header", 400));
    }

    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return next(createApiError("Invalid request body", 400));
    }

    const { address, items, paymentMethod, notes } = req.body;

    // Validate address
    if (!address || typeof address !== "object" || Array.isArray(address)) {
      return next(createApiError("Missing or invalid address", 400));
    }

    const { fullName, phone, house, street, addressLine, city, state, pincode } = address;
    const resolvedAddressLine = addressLine || (house && street ? `${house}, ${street}` : house || street);

    if (
      typeof fullName !== "string" || fullName.trim() === "" ||
      typeof phone !== "string" || phone.trim() === "" ||
      typeof city !== "string" || city.trim() === "" ||
      typeof state !== "string" || state.trim() === "" ||
      typeof pincode !== "string" || pincode.trim() === "" ||
      (typeof resolvedAddressLine !== "string" || resolvedAddressLine.trim() === "")
    ) {
      return next(createApiError("Address must contain valid non-empty string fields", 400));
    }

    // Validate items
    if (!Array.isArray(items) || items.length === 0) {
      return next(createApiError("Missing or invalid items array", 400));
    }

    for (const item of items) {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return next(createApiError("Each item must be a valid object", 400));
      }
      if (typeof item.productId !== "string" || item.productId.trim() === "") {
        return next(createApiError("Item productId must be a non-empty string", 400));
      }
      if (
        typeof item.quantity !== "number" ||
        !Number.isFinite(item.quantity) ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        return next(createApiError("Item quantity must be a positive integer", 400));
      }
    }

    const order = await createOrderService({
      userId,
      address,
      items,
      paymentMethod,
      notes,
      idempotencyKey,
    });

    res.status(201).json({ status: "ok", order });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message.includes("Products not found") || err.message.includes("unavailable") || err.message.includes("Invalid quantity") || err.message.includes("at least one item"))) {
      return next(createApiError(err.message, 400));
    }
    next(err);
  }
};

/** PUT /api/orders/:id/status — update order status (ADMIN ONLY) */
export const updateStatus: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(createApiError("Unauthorized", 401));
    }

    if (req.user?.role !== "ADMIN") {
      return next(createApiError("Forbidden", 403));
    }

    const orderId = req.params["id"];
    if (!orderId || typeof orderId !== "string") {
      return next(createApiError("Invalid order ID", 400));
    }

    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return next(createApiError("Invalid request body", 400));
    }

    const { status } = req.body;

    // Validate status
    const validStatuses: OrderStatus[] = [
      "Placed",
      "Confirmed",
      "Preparing",
      "OutForDelivery",
      "Delivered",
      "Cancelled"
    ];

    if (!status || typeof status !== "string" || !validStatuses.includes(status as OrderStatus)) {
      return next(createApiError(`Invalid status. Must be one of: ${validStatuses.join(", ")}`, 400));
    }

    const order = await getOrderById(orderId);
    if (!order) {
      return next(createApiError(`Order not found: ${orderId}`, 404));
    }

    const updatedOrder = await updateOrderStatus(orderId, status as OrderStatus);

    res.json({ status: "ok", order: updatedOrder });
  } catch (err) {
    next(err);
  }
};
