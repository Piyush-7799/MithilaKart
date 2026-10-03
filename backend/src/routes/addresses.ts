/**
 * src/routes/addresses.ts
 */

import { Router } from "express";
import { getAddresses } from "../controllers/userController.js";

const router = Router();

// GET /api/addresses?userId=xxx
router.get("/", getAddresses);

export default router;
