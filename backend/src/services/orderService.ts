/**
 * src/services/orderService.ts
 * All Order database operations via Prisma.
 */

import { prisma } from "../lib/prisma.js";
import type { Prisma, OrderStatus } from "@prisma/client";

export interface OrderQueryParams {
  userId?: string;
  status?: string;
  limit?: string;
  offset?: string;
}

export async function listOrders(params: OrderQueryParams) {
  const where: Prisma.OrderWhereInput = {};

  if (params.userId) {
    where.userId = params.userId;
  }

  if (params.status) {
    where.status = params.status as OrderStatus;
  }

  const limit = Math.min(parseInt(params.limit ?? "20", 10), 100);
  const offset = parseInt(params.offset ?? "0", 10);

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
  ]);

  return { total, limit, offset, orders };
}

export async function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
}
