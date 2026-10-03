/**
 * src/services/productService.ts
 * All Product database operations via Prisma.
 */

import { prisma } from "../lib/prisma.js";
import type { Prisma } from "@prisma/client";

export interface ProductQueryParams {
  search?: string;
  category?: string;
  available?: string; // "true" | "false" from query string
  limit?: string;
  offset?: string;
}

/**
 * List products with optional filters.
 * Returns [] (not fake data) if the database has no products yet.
 */
export async function listProducts(params: ProductQueryParams) {
  const where: Prisma.ProductWhereInput = {};

  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: "insensitive" } },
      { description: { contains: params.search, mode: "insensitive" } },
      { category: { contains: params.search, mode: "insensitive" } },
    ];
  }

  if (params.category) {
    where.category = { equals: params.category, mode: "insensitive" };
  }

  if (params.available !== undefined) {
    where.isAvailable = params.available === "true";
  }

  const limit = Math.min(parseInt(params.limit ?? "50", 10), 100);
  const offset = parseInt(params.offset ?? "0", 10);

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: [{ isMithilaSpecial: "desc" }, { name: "asc" }],
      take: limit,
      skip: offset,
    }),
  ]);

  return { total, limit, offset, products };
}

/**
 * Get a single product by ID.
 * Returns null if not found (caller handles 404).
 */
export async function getProductById(id: string) {
  return prisma.product.findUnique({ where: { id } });
}
