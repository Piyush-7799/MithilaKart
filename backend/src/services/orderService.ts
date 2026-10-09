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
  console.info("[CheckoutTiming] orderService.createOrder started");
  if (!params.items || params.items.length === 0) {
    throw new Error("Order must contain at least one item.");
  }

  try {
    // 1. Concurrent Reads
    const tReads = performance.now();
    const aggregatedItemsMap = new Map<string, number>();
    for (const item of params.items) {
      if (!Number.isSafeInteger(item.quantity) || item.quantity <= 0 || item.quantity > 9999) {
        throw new Error(`Invalid quantity for product ${item.productId}`);
      }
      const newQuantity = (aggregatedItemsMap.get(item.productId) || 0) + item.quantity;
      if (newQuantity > 9999) {
        throw new Error(`Invalid quantity for product ${item.productId}`);
      }
      aggregatedItemsMap.set(item.productId, newQuantity);
    }
    const aggregatedItems = Array.from(aggregatedItemsMap.entries()).map(([productId, quantity]) => ({ productId, quantity }));
    const productIds = aggregatedItems.map((i) => i.productId);

    const [existingIdemp, products, userExists] = await Promise.all([
      params.idempotencyKey && params.userId
        ? prisma.orderIdempotency.findUnique({
            where: { key: params.idempotencyKey },
            include: { order: { include: { items: true } } },
          })
        : Promise.resolve(null),
      prisma.product.findMany({
        where: { id: { in: productIds } },
      }),
      params.userId
        ? prisma.user.findUnique({ where: { id: params.userId } })
        : Promise.resolve(null),
    ]);
    console.info(`[CheckoutTiming] Concurrent reads took ${Math.round(performance.now() - tReads)}ms`);

    // 0. Check idempotency
    if (existingIdemp) {
      if (existingIdemp.userId !== params.userId) {
        throw new Error("Idempotency key mismatch");
      }
      return existingIdemp.order;
    }

    if (products.length !== productIds.length) {
      const foundIds = products.map((p) => p.id);
      const missing = productIds.filter((id) => !foundIds.includes(id));
      throw new Error(`Products not found: ${missing.join(", ")}`);
    }

    let subtotal = 0;
    let savings = 0;
    const orderItemsData: Prisma.OrderItemCreateWithoutOrderInput[] = [];

    for (const item of aggregatedItems) {
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
    const finalUserId = params.userId;

    // 2. Sequential Write Transaction
    const operations: any[] = [];

    if (finalUserId && !userExists) {
      operations.push(
        prisma.user.upsert({
          where: { id: finalUserId },
          update: {},
          create: {
            id: finalUserId,
            fullName: params.address.fullName || "Guest",
          },
        })
      );
    }

    operations.push(
      prisma.order.create({
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
      })
    );

    const txStart = performance.now();
    const results = await prisma.$transaction(operations);
    console.info(`[CheckoutTiming] Sequential transaction took ${Math.round(performance.now() - txStart)}ms`);

    // Return the created order (always the last operation)
    return results[results.length - 1];
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

export async function updateOrderStatus(id: string, status: OrderStatus) {
  return await prisma.order.update({
    where: { id },
    data: { status },
    include: { items: true },
  });
}
