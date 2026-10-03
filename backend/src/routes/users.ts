/**
 * src/routes/users.ts
 */

import { Router } from "express";
import { getUser } from "../controllers/userController.js";

const router = Router();

// GET /api/users/:id
router.get("/:id", getUser);

export default router;
