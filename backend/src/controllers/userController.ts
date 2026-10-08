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

    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return next(createApiError("Invalid request body", 400));
    }

    const { fullName, phone, house, street, city, state, pincode, landmark, label } = req.body;

    if (
      typeof fullName !== "string" || fullName.trim() === "" ||
      typeof phone !== "string" || phone.trim() === "" ||
      typeof house !== "string" || house.trim() === "" ||
      typeof street !== "string" || street.trim() === "" ||
      typeof city !== "string" || city.trim() === "" ||
      typeof state !== "string" || state.trim() === "" ||
      typeof pincode !== "string" || pincode.trim() === ""
    ) {
      return next(createApiError("Missing or invalid required address fields. Must be non-empty strings.", 400));
    }

    if (landmark !== undefined && (typeof landmark !== "string" || landmark.trim() === "")) {
      return next(createApiError("Landmark must be a non-empty string if provided", 400));
    }

    if (label !== undefined && (typeof label !== "string" || label.trim() === "")) {
      return next(createApiError("Label must be a non-empty string if provided", 400));
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

    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return next(createApiError("Invalid request body", 400));
    }

    const { fullName, phone, house, street, city, state, pincode, landmark, label } = req.body;

    // Validate any provided fields
    if (fullName !== undefined && (typeof fullName !== "string" || fullName.trim() === "")) {
      return next(createApiError("fullName must be a non-empty string", 400));
    }
    if (phone !== undefined && (typeof phone !== "string" || phone.trim() === "")) {
      return next(createApiError("phone must be a non-empty string", 400));
    }
    if (house !== undefined && (typeof house !== "string" || house.trim() === "")) {
      return next(createApiError("house must be a non-empty string", 400));
    }
    if (street !== undefined && (typeof street !== "string" || street.trim() === "")) {
      return next(createApiError("street must be a non-empty string", 400));
    }
    if (city !== undefined && (typeof city !== "string" || city.trim() === "")) {
      return next(createApiError("city must be a non-empty string", 400));
    }
    if (state !== undefined && (typeof state !== "string" || state.trim() === "")) {
      return next(createApiError("state must be a non-empty string", 400));
    }
    if (pincode !== undefined && (typeof pincode !== "string" || pincode.trim() === "")) {
      return next(createApiError("pincode must be a non-empty string", 400));
    }
    if (landmark !== undefined && (typeof landmark !== "string" || landmark.trim() === "")) {
      return next(createApiError("landmark must be a non-empty string", 400));
    }
    if (label !== undefined && (typeof label !== "string" || label.trim() === "")) {
      return next(createApiError("label must be a non-empty string", 400));
    }

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
