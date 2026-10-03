/**
 * src/routes/products.ts
 */

import { Router } from "express";
import { getProducts, getProduct } from "../controllers/productController.js";

const router = Router();

// GET /api/products?search=&category=&available=
router.get("/", getProducts);

// GET /api/products/:id
router.get("/:id", getProduct);

export default router;
