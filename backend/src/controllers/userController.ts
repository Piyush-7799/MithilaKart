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
    const user = await getUserById(String(req.params["id"] ?? ""));
    if (!user) {
      return next(createApiError(`User not found: ${req.params["id"]}`, 404));
    }
    res.json({ status: "ok", user });
  } catch (err) {
    next(err);
  }
};

/** GET /api/addresses?userId=xxx */
export const getAddresses: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.query["userId"] as string | undefined;
    if (!userId) {
      return next(createApiError("userId query parameter is required", 400));
    }
    const addresses = await getAddressesByUserId(userId);
    res.json({ status: "ok", addresses });
  } catch (err) {
    next(err);
  }
};
