/**
 * src/routes/addresses.ts
 */

import { Router } from "express";
import { getAddresses } from "../controllers/userController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// GET /api/addresses
router.get("/", authenticate, getAddresses);

export default router;
