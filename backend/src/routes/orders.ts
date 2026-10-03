/**
 * src/routes/orders.ts
 */

import { Router } from "express";
import { getOrders, getOrder } from "../controllers/orderController.js";

const router = Router();

// GET /api/orders?userId=&status=
router.get("/", getOrders);

// GET /api/orders/:id
router.get("/:id", getOrder);

export default router;
