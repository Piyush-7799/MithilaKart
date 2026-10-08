/**
 * src/controllers/userController.ts
 */

import type { RequestHandler } from "express";
import {
  getUserById,
  getAddressesByUserId,
  createAddress,
  updateAddress,
  deleteAddress,
  getAddressById,
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

/** POST /api/addresses */
export const createNewAddress: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return next(createApiError("Unauthorized", 401));

    const { fullName, phone, house, street, city, state, pincode, landmark, label } = req.body;

    if (!fullName || !phone || !house || !street || !city || !state || !pincode) {
      return next(createApiError("Missing required address fields", 400));
    }

    const address = await createAddress({
      userId,
      fullName,
      phone,
      house,
      street,
      city,
      state,
      pincode,
      landmark,
      label: label || "Home"
    });

    res.status(201).json({ status: "ok", address });
  } catch (err) {
    next(err);
  }
};

/** PUT /api/addresses/:id */
export const updateExistingAddress: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return next(createApiError("Unauthorized", 401));

    const id = req.params.id as string;
    const existing = await getAddressById(id ?? "");
    if (!existing) return next(createApiError("Address not found", 404));
    if (existing.userId !== userId && req.user?.role !== "ADMIN") return next(createApiError("Forbidden", 403));

    const { fullName, phone, house, street, city, state, pincode, landmark, label } = req.body;

    const address = await updateAddress(id!, {
      ...(fullName && { fullName }),
      ...(phone && { phone }),
      ...(house && { house }),
      ...(street && { street }),
      ...(city && { city }),
      ...(state && { state }),
      ...(pincode && { pincode }),
      ...(landmark !== undefined && { landmark }),
      ...(label && { label })
    });

    res.json({ status: "ok", address });
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/addresses/:id */
export const removeAddress: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return next(createApiError("Unauthorized", 401));

    const id = req.params.id as string;
    const existing = await getAddressById(id ?? "");
    if (!existing) return next(createApiError("Address not found", 404));
    if (existing.userId !== userId && req.user?.role !== "ADMIN") return next(createApiError("Forbidden", 403));

    await deleteAddress(id!);

    res.json({ status: "ok" });
  } catch (err) {
    next(err);
  }
};
