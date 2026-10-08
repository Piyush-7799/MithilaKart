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

export interface CreateOrderParams {
  userId?: string;
  address: {
    fullName: string;
    phone: string;
    house: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
    label?: string;
    displayName?: string;
  };
  items: {
    productId: string;
    quantity: number;
  }[];
  paymentMethod: string;
  notes?: string;
  idempotencyKey?: string;
}

export async function createOrder(params: CreateOrderParams) {
  if (!params.items || params.items.length === 0) {
    throw new Error("Order must contain at least one item.");
  }

  try {
    return await prisma.$transaction(async (tx) => {
      // 0. Check idempotency
    if (params.idempotencyKey && params.userId) {
      const existing = await tx.orderIdempotency.findUnique({
        where: { key: params.idempotencyKey },
        include: { order: { include: { items: true } } },
      });
      if (existing) {
        if (existing.userId !== params.userId) {
          throw new Error("Idempotency key mismatch");
        }
        return existing.order;
      }
    }

    // 1. Fetch products
    const productIds = params.items.map((i) => i.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      const foundIds = products.map((p) => p.id);
      const missing = productIds.filter((id) => !foundIds.includes(id));
      throw new Error(`Products not found: ${missing.join(", ")}`);
    }

    let subtotal = 0;
    let savings = 0;
    const orderItemsData: Prisma.OrderItemCreateWithoutOrderInput[] = [];

    for (const item of params.items) {
      if (item.quantity <= 0) {
        throw new Error(`Invalid quantity for product ${item.productId}`);
      }
      
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }
      if (!product.isAvailable) {
        throw new Error(`Product ${product.name} is currently unavailable`);
      }

      const lineTotal = product.price * item.quantity;
      const lineSavings = (product.mrp - product.price) * item.quantity;
      
      subtotal += lineTotal;
      if (lineSavings > 0) savings += lineSavings;

      orderItemsData.push({
        product: { connect: { id: product.id } },
        nameSnapshot: product.name,
        imageSnapshot: product.image,
        quantity: item.quantity,
        priceSnapshot: product.price,
        mrpSnapshot: product.mrp,
        unitSnapshot: product.unit,
        lineTotal,
      });
    }

    const deliveryFee = subtotal > 300 ? 0 : 30;
    const total = subtotal + deliveryFee;

    // Ensure user exists if userId is provided
    const finalUserId = params.userId;
    if (finalUserId) {
      const userExists = await tx.user.findUnique({ where: { id: finalUserId } });
      if (!userExists) {
        await tx.user.create({
          data: {
            id: finalUserId,
            fullName: params.address.fullName || "Guest",
          }
        });
      }
    }

    const order = await tx.order.create({
      data: {
        userId: finalUserId,
        status: "Placed",
        subtotal,
        deliveryFee,
        total,
        savings,
        deliveryEta: "45 mins",
        paymentMethod: params.paymentMethod || "Cash on Delivery",
        estimatedDelivery: "45 mins",
        notes: params.notes,
        addressFullName: params.address.fullName,
        addressPhone: params.address.phone,
        addressHouse: params.address.house,
        addressStreet: params.address.street,
        addressCity: params.address.city,
        addressState: params.address.state,
        addressPincode: params.address.pincode,
        addressLandmark: params.address.landmark,
        addressLabel: params.address.label,
        addressDisplay: params.address.displayName,
        items: {
          create: orderItemsData,
        },
        ...(params.idempotencyKey && finalUserId ? {
          idempotency: {
            create: {
              key: params.idempotencyKey,
              userId: finalUserId,
            }
          }
        } : {}),
      },
      include: {
        items: true,
      },
    });

    return order;
  }, {
    maxWait: 5000,
    timeout: 20000,
  });
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      err.code === "P2002" &&
      params.idempotencyKey &&
      params.userId
    ) {
      const existing = await prisma.orderIdempotency.findUnique({
        where: { key: params.idempotencyKey },
        include: { order: { include: { items: true } } },
      });

      if (existing) {
        if (existing.userId !== params.userId) {
          throw new Error("Idempotency key mismatch", { cause: err });
        }
        return existing.order;
      }
    }
    throw err;
  }
}
