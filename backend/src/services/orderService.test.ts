import assert from "node:assert";
import { createOrder } from "./orderService.js";
import { prisma } from "../lib/prisma.js";

interface MockProduct {
  id: string;
  name: string;
  price: number;
  mrp: number;
  unit: string;
  image: string;
  isAvailable: boolean;
}

interface MockOrderItem {
  quantity: number;
  [key: string]: unknown;
}

interface MockOrderCreateData {
  items: {
    create: MockOrderItem[];
  };
  subtotal: number;
  deliveryFee: number;
  total: number;
  savings: number;
  [key: string]: unknown;
}

function setMock<T, K extends keyof T>(target: T, key: K, value: unknown): void {
  (target as Record<K, unknown>)[key] = value;
}

async function runTests() {
  console.log("Starting orderService tests...");

  // Mock Prisma methods
  const originalFindUniqueIdemp = prisma.orderIdempotency.findUnique;
  const originalFindManyProduct = prisma.product.findMany;
  const originalFindUniqueUser = prisma.user.findUnique;
  const originalTransaction = prisma.$transaction;
  const originalUserUpsert = prisma.user.upsert;
  const originalOrderCreate = prisma.order.create;

  let productsDb: MockProduct[] = [];
  let transactionCalled: boolean;
  let orderCreatedData: MockOrderCreateData | null;

  const getCreatedOrderData = (): MockOrderCreateData => {
    assert(orderCreatedData, "orderCreatedData should be set");
    return orderCreatedData;
  };

  setMock(prisma.orderIdempotency, "findUnique", async () => null);
  setMock(prisma.user, "findUnique", async () => null);
  setMock(
    prisma.product,
    "findMany",
    async ({ where }: { where: { id: { in: string[] } } }) => {
      const ids = where.id.in;
      return productsDb.filter((p) => ids.includes(p.id));
    }
  );

  const executeMockTransaction = async (ops: unknown[]) => {
    transactionCalled = true;
    // Simulate executing the operations
    const results: unknown[] = [];
    for (const op of ops) {
      if (op === "mocked_upsert") results.push({ id: "user-1" });
      else if (op === "mocked_order") results.push({ id: "order-1" });
      else results.push(await (op as Promise<unknown>));
    }
    return results;
  };
  setMock(prisma, "$transaction", executeMockTransaction);

  // Intercept prisma calls within transaction since they return promises
  setMock(prisma.user, "upsert", () => "mocked_upsert");
  setMock(prisma.order, "create", (args: { data: MockOrderCreateData }) => {
    orderCreatedData = args.data;
    return "mocked_order";
  });

  const address = {
    fullName: "John",
    phone: "123",
    house: "1",
    street: "A",
    city: "B",
    state: "C",
    pincode: "12345",
  };

  try {
    // Test 1: Duplicate product IDs should combine quantities
    productsDb = [
      { id: "p1", name: "P1", price: 10, mrp: 15, unit: "kg", image: "img", isAvailable: true },
    ];
    transactionCalled = false;
    orderCreatedData = null;

    await createOrder({
      userId: "u1",
      address,
      paymentMethod: "cash",
      items: [
        { productId: "p1", quantity: 2 },
        { productId: "p1", quantity: 3 },
      ],
    });

    assert(transactionCalled, "Transaction should be called");
    const test1OrderData = getCreatedOrderData();
    assert.strictEqual(test1OrderData.items.create.length, 1, "Should aggregate into 1 item");
    assert.strictEqual(test1OrderData.items.create[0].quantity, 5, "Quantity should be summed (5)");
    assert.strictEqual(test1OrderData.subtotal, 50, "Subtotal should be 10 * 5 = 50");
    assert.strictEqual(test1OrderData.deliveryFee, 30, "Delivery fee should be 30 for <300");
    assert.strictEqual(test1OrderData.total, 80, "Total should be 50 + 30 = 80");
    assert.strictEqual(test1OrderData.savings, 25, "Savings should be (15-10)*5 = 25");
    console.log("✅ Test 1 Passed: Duplicate products aggregated");

    // Test 2: Missing products should fail
    productsDb = [
      { id: "p1", name: "P1", price: 10, mrp: 15, unit: "kg", image: "img", isAvailable: true },
    ];
    try {
      await createOrder({
        userId: "u1",
        address,
        paymentMethod: "cash",
        items: [
          { productId: "p1", quantity: 1 },
          { productId: "p2", quantity: 1 },
        ],
      });
      assert.fail("Should have thrown error");
    } catch (e: unknown) {
      assert(
        e instanceof Error && e.message.includes("Products not found: p2"),
        "Error message should mention missing product p2"
      );
    }
    console.log("✅ Test 2 Passed: Missing products validated");

    // Test 3: Invalid quantities should fail
    const invalidQuantities = [
      [{ productId: "p1", quantity: -1 }],
      [{ productId: "p1", quantity: 1.5 }],
      [{ productId: "p1", quantity: 10000 }], // per-item cap
      [{ productId: "p1", quantity: 5000 }, { productId: "p1", quantity: 5000 }], // aggregated cap
    ];

    for (const items of invalidQuantities) {
      try {
        await createOrder({
          userId: "u1",
          address,
          paymentMethod: "cash",
          items,
        });
        assert.fail("Should have thrown error");
      } catch (e: unknown) {
        assert(
          e instanceof Error && e.message.includes("Invalid quantity"),
          "Error message should mention invalid quantity"
        );
      }
    }
    console.log("✅ Test 3 Passed: Invalid quantities rejected");

    // Test 4: Normal checkout
    productsDb = [
      { id: "p1", name: "P1", price: 10, mrp: 15, unit: "kg", image: "img", isAvailable: true },
      { id: "p2", name: "P2", price: 400, mrp: 400, unit: "kg", image: "img", isAvailable: true },
    ];
    orderCreatedData = null;
    await createOrder({
      userId: "u1",
      address,
      paymentMethod: "cash",
      items: [
        { productId: "p1", quantity: 1 },
        { productId: "p2", quantity: 1 },
      ],
    });
    const test4OrderData = getCreatedOrderData();
    assert.strictEqual(test4OrderData.items.create.length, 2);
    assert.strictEqual(test4OrderData.subtotal, 410, "Subtotal should be 10*1 + 400*1 = 410");
    assert.strictEqual(test4OrderData.deliveryFee, 0, "Delivery fee should be 0 since subtotal > 300");
    assert.strictEqual(test4OrderData.total, 410, "Total should be 410 + 0 = 410");
    assert.strictEqual(test4OrderData.savings, 5, "Savings should be (15-10)*1 + 0 = 5");
    console.log("✅ Test 4 Passed: Normal checkout successful");

    // Test 5: Idempotency fallback on P2002
    let findUniqueIdempCalledForFallback = false;
    setMock(prisma, "$transaction", async () => {
      throw { code: "P2002" }; // simulate unique constraint violation
    });
    setMock(
      prisma.orderIdempotency,
      "findUnique",
      async (args: { where: { key: string } }) => {
        if (args.where.key === "idem-key-1") {
          findUniqueIdempCalledForFallback = true;
          return { userId: "u1", order: { id: "existing-order-1" } };
        }
        return null;
      }
    );

    productsDb = [
      { id: "p1", name: "P1", price: 10, mrp: 15, unit: "kg", image: "img", isAvailable: true },
    ];

    const existingOrder = await createOrder({
      userId: "u1",
      address,
      paymentMethod: "cash",
      idempotencyKey: "idem-key-1",
      items: [{ productId: "p1", quantity: 1 }],
    });

    assert(findUniqueIdempCalledForFallback, "findUnique should be called for idempotency fallback");
    assert.strictEqual(existingOrder.id, "existing-order-1", "Should return the existing order on P2002");
    console.log("✅ Test 5 Passed: Idempotency fallback on P2002 successful");

    // Test 6: Unavailable products should fail
    // Restore transaction mock for this test
    setMock(prisma, "$transaction", executeMockTransaction);

    productsDb = [
      { id: "p1", name: "P1", price: 10, mrp: 15, unit: "kg", image: "img", isAvailable: false },
    ];

    try {
      await createOrder({
        userId: "u1",
        address,
        paymentMethod: "cash",
        items: [{ productId: "p1", quantity: 1 }],
      });
      assert.fail("Should have thrown error for unavailable product");
    } catch (e: unknown) {
      assert(
        e instanceof Error && e.message.includes("is currently unavailable"),
        "Error message should mention unavailable product"
      );
    }
    console.log("✅ Test 6 Passed: Unavailable checkout rejected");
  } finally {
    // Restore mocks safely
    prisma.orderIdempotency.findUnique = originalFindUniqueIdemp;
    prisma.product.findMany = originalFindManyProduct;
    prisma.user.findUnique = originalFindUniqueUser;
    prisma.$transaction = originalTransaction;
    prisma.user.upsert = originalUserUpsert;
    prisma.order.create = originalOrderCreate;
  }
}

runTests().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});
