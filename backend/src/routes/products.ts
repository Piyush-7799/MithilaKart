/**
 * src/routes/products.ts
 */

import { Router } from "express";
import { getProducts, getProduct, updateAvailability } from "../controllers/productController.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = Router();

// GET /api/products?search=&category=&available=
router.get("/", getProducts);

// GET /api/products/:id
router.get("/:id", getProduct);

// PUT /api/products/:id/availability
router.put("/:id/availability", authenticate, requireAdmin, updateAvailability);

export default router;
