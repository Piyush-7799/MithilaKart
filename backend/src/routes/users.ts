/**
 * src/routes/users.ts
 */

import { Router } from "express";
import { getUser } from "../controllers/userController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// GET /api/users/:id
router.get("/:id", authenticate, getUser);

export default router;
