/**
 * src/routes/orders.ts
 */

import { Router } from "express";
import { getOrders, getOrder, createOrder } from "../controllers/orderController.js";

const router = Router();

// GET /api/orders?userId=&status=
router.get("/", getOrders);

// POST /api/orders
router.post("/", createOrder);

// GET /api/orders/:id
router.get("/:id", getOrder);

export default router;
