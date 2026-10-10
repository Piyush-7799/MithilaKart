import type { RequestHandler } from "express";
import { prisma } from "../lib/prisma.js";
import { createApiError } from "../middleware/errorHandler.js";
import { hashPassword, verifyPassword, generateToken } from "../services/authService.js";
import { env } from "../config/env.js";

function setAuthCookie(res: import("express").Response, token: string) {
  res.cookie("token", token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });
}


export const register: RequestHandler = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || typeof fullName !== "string" || fullName.trim() === "") {
      return next(createApiError("Full name is required", 400));
    }
    if (!email || typeof email !== "string" || email.trim() === "") {
      return next(createApiError("Email is required", 400));
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return next(createApiError("Password must be at least 6 characters long", 400));
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return next(createApiError("Email is already registered", 400));
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: normalizedEmail,
        passwordHash: hashedPassword,
        role: "CUSTOMER",
      },
    });

    const token = generateToken({ id: newUser.id, role: newUser.role });
    setAuthCookie(res, token);

    res.status(201).json({
      status: "ok",
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return next(createApiError("Email and password are required", 400));
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !user.passwordHash) {
      return next(createApiError("Invalid email or password", 401));
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return next(createApiError("Invalid email or password", 401));
    }

    const token = generateToken({ id: user.id, role: user.role });
    setAuthCookie(res, token);

    res.json({
      status: "ok",
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const me: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(createApiError("Unauthorized", 401));
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return next(createApiError("User not found", 404));
    }

    res.json({
      status: "ok",
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const logout: RequestHandler = (req, res) => {
  res.clearCookie("token", {
    path: "/",
    sameSite: env.isProd ? "none" : "lax",
    secure: env.isProd,
  });
  res.json({ status: "ok" });
};
