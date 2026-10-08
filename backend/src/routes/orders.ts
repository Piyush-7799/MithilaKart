/**
 * src/routes/orders.ts
 */

import { Router } from "express";
import { getOrders, getOrder, createOrder, updateStatus } from "../controllers/orderController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// GET /api/orders?status=
router.get("/", authenticate, getOrders);

// POST /api/orders
router.post("/", authenticate, createOrder);

// GET /api/orders/:id
router.get("/:id", authenticate, getOrder);

// PUT /api/orders/:id/status
router.put("/:id/status", authenticate, updateStatus);

export default router;
