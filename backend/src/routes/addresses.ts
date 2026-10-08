/**
 * src/routes/addresses.ts
 */

import { Router } from "express";
import { getAddresses, createNewAddress, updateExistingAddress, removeAddress } from "../controllers/userController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, getAddresses);
router.post("/", authenticate, createNewAddress);
router.put("/:id", authenticate, updateExistingAddress);
router.delete("/:id", authenticate, removeAddress);

export default router;
