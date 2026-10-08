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

import { Prisma } from "@prisma/client";

export async function createAddress(data: Prisma.AddressUncheckedCreateInput) {
  return prisma.address.create({
    data
  });
}

export async function updateAddress(id: string, data: Prisma.AddressUpdateInput) {
  return prisma.address.update({
    where: { id },
    data
  });
}

export async function deleteAddress(id: string) {
  return prisma.address.delete({
    where: { id }
  });
}

export async function getAddressById(id: string) {
  return prisma.address.findUnique({
    where: { id }
  });
}
