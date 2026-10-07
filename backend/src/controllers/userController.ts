/**
 * src/controllers/userController.ts
 */

import type { RequestHandler } from "express";
import {
  getUserById,
  getAddressesByUserId,
} from "../services/userService.js";
import { createApiError } from "../middleware/errorHandler.js";

/** GET /api/users/:id */
export const getUser: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(createApiError("Unauthorized", 401));
    }

    const targetUserId = req.params["id"];
    if (userId !== targetUserId && req.user?.role !== "ADMIN") {
      return next(createApiError("Forbidden", 403));
    }

    const user = await getUserById(String(targetUserId ?? ""));
    if (!user) {
      return next(createApiError(`User not found: ${targetUserId}`, 404));
    }

    res.json({ status: "ok", user });
  } catch (err) {
    next(err);
  }
};

/** GET /api/addresses */
export const getAddresses: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(createApiError("Unauthorized", 401));
    }

    const addresses = await getAddressesByUserId(userId);
    res.json({ status: "ok", addresses });
  } catch (err) {
    next(err);
  }
};
