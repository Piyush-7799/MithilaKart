/**
 * src/routes/orders.ts
 */

import { Router } from "express";
import { getOrders, getOrder, createOrder } from "../controllers/orderController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// GET /api/orders?status=
router.get("/", authenticate, getOrders);

// POST /api/orders
router.post("/", authenticate, createOrder);

// GET /api/orders/:id
router.get("/:id", authenticate, getOrder);

export default router;
