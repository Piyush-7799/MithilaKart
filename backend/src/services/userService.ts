/**
 * src/services/userService.ts
 * User and Address database operations via Prisma.
 */

import { prisma } from "../lib/prisma.js";

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getAddressesByUserId(userId: string) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
}
