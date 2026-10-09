import assert from "node:assert";
import { createOrder } from "./orderService.js";
import { prisma } from "../lib/prisma.js";

async function runTests() {
  console.log("Starting orderService tests...");

  // Mock Prisma methods
  const originalFindUniqueIdemp = prisma.orderIdempotency.findUnique;
  const originalFindManyProduct = prisma.product.findMany;
  const originalFindUniqueUser = prisma.user.findUnique;
  const originalTransaction = prisma.$transaction;
  const originalUserUpsert = prisma.user.upsert;
  const originalOrderCreate = prisma.order.create;

  let productsDb: any[] = [];
  let transactionCalled = false;
  let orderCreatedData: any = null;

  // @ts-ignore
  prisma.orderIdempotency.findUnique = async () => null as any;
  // @ts-ignore
  prisma.user.findUnique = async () => null as any;
  // @ts-ignore
  prisma.product.findMany = async ({ where }: any) => {
    const ids = where.id.in;
    return productsDb.filter(p => ids.includes(p.id));
  };
  // @ts-ignore
  prisma.$transaction = async (ops: any[]) => {
    transactionCalled = true;
    // Simulate executing the operations
    const results = [];
    for (const op of ops) {
      if (op === 'mocked_upsert') results.push({ id: 'user-1' });
      else if (op === 'mocked_order') results.push({ id: 'order-1' });
      else results.push(await op);
    }
    return results;
  };

  // Quick hack to intercept prisma calls within transaction since they return promises
  (prisma.user as any).upsert = () => 'mocked_upsert';
  (prisma.order as any).create = (args: any) => {
    orderCreatedData = args.data;
    return 'mocked_order';
  };

  const address = {
    fullName: "John", phone: "123", house: "1", street: "A", city: "B", state: "C", pincode: "12345"
  };

  try {
    // Test 1: Duplicate product IDs should combine quantities
    productsDb = [
      { id: "p1", name: "P1", price: 10, mrp: 15, unit: "kg", image: "img", isAvailable: true }
    ];
    transactionCalled = false;
    orderCreatedData = null;

    await createOrder({
      userId: "u1",
      address,
      paymentMethod: "cash",
      items: [
        { productId: "p1", quantity: 2 },
        { productId: "p1", quantity: 3 }
      ]
    });

    assert(transactionCalled, "Transaction should be called");
    assert.strictEqual(orderCreatedData.items.create.length, 1, "Should aggregate into 1 item");
    assert.strictEqual(orderCreatedData.items.create[0].quantity, 5, "Quantity should be summed (5)");
    assert.strictEqual(orderCreatedData.subtotal, 50, "Subtotal should be 10 * 5 = 50");
    assert.strictEqual(orderCreatedData.deliveryFee, 30, "Delivery fee should be 30 for <300");
    assert.strictEqual(orderCreatedData.total, 80, "Total should be 50 + 30 = 80");
    assert.strictEqual(orderCreatedData.savings, 25, "Savings should be (15-10)*5 = 25");
    console.log("✅ Test 1 Passed: Duplicate products aggregated");

    // Test 2: Missing products should fail
    productsDb = [
      { id: "p1", name: "P1", price: 10, mrp: 15, unit: "kg", image: "img", isAvailable: true }
    ];
    try {
      await createOrder({
        userId: "u1",
        address,
        paymentMethod: "cash",
        items: [
          { productId: "p1", quantity: 1 },
          { productId: "p2", quantity: 1 }
        ]
      });
      assert.fail("Should have thrown error");
    } catch (e: any) {
      assert(e.message.includes("Products not found: p2"), "Error message should mention missing product p2");
    }
    console.log("✅ Test 2 Passed: Missing products validated");

    // Test 3: Invalid quantities should fail
    const invalidQuantities = [
      [{ productId: "p1", quantity: -1 }],
      [{ productId: "p1", quantity: 1.5 }],
      [{ productId: "p1", quantity: 10000 }], // per-item cap
      [{ productId: "p1", quantity: 5000 }, { productId: "p1", quantity: 5000 }] // aggregated cap
    ];

    for (const items of invalidQuantities) {
      try {
        await createOrder({
          userId: "u1", address, paymentMethod: "cash", items
        });
        assert.fail("Should have thrown error");
      } catch (e: any) {
        assert(e.message.includes("Invalid quantity"), "Error message should mention invalid quantity");
      }
    }
    console.log("✅ Test 3 Passed: Invalid quantities rejected");

    // Test 4: Normal checkout
    productsDb = [
      { id: "p1", name: "P1", price: 10, mrp: 15, unit: "kg", image: "img", isAvailable: true },
      { id: "p2", name: "P2", price: 400, mrp: 400, unit: "kg", image: "img", isAvailable: true }
    ];
    orderCreatedData = null;
    await createOrder({
      userId: "u1",
      address,
      paymentMethod: "cash",
      items: [
        { productId: "p1", quantity: 1 },
        { productId: "p2", quantity: 1 }
      ]
    });
    assert.strictEqual(orderCreatedData.items.create.length, 2);
    assert.strictEqual(orderCreatedData.subtotal, 410, "Subtotal should be 10*1 + 400*1 = 410");
    assert.strictEqual(orderCreatedData.deliveryFee, 0, "Delivery fee should be 0 since subtotal > 300");
    assert.strictEqual(orderCreatedData.total, 410, "Total should be 410 + 0 = 410");
    assert.strictEqual(orderCreatedData.savings, 5, "Savings should be (15-10)*1 + 0 = 5");
    console.log("✅ Test 4 Passed: Normal checkout successful");

    // Test 5: Idempotency fallback on P2002
    let findUniqueIdempCalledForFallback = false;
    // @ts-ignore
    prisma.$transaction = async () => {
      throw { code: "P2002" }; // simulate unique constraint violation
    };
    // @ts-ignore
    prisma.orderIdempotency.findUnique = async (args: any) => {
      if (args.where.key === "idem-key-1") {
        findUniqueIdempCalledForFallback = true;
        return { userId: "u1", order: { id: "existing-order-1" } } as any;
      }
      return null as any;
    };

    productsDb = [
      { id: "p1", name: "P1", price: 10, mrp: 15, unit: "kg", image: "img", isAvailable: true }
    ];

    const existingOrder = await createOrder({
      userId: "u1",
      address,
      paymentMethod: "cash",
      idempotencyKey: "idem-key-1",
      items: [
        { productId: "p1", quantity: 1 }
      ]
    });

    assert(findUniqueIdempCalledForFallback, "findUnique should be called for idempotency fallback");
    assert.strictEqual(existingOrder.id, "existing-order-1", "Should return the existing order on P2002");
    console.log("✅ Test 5 Passed: Idempotency fallback on P2002 successful");

    // Test 6: Unavailable products should fail
    // Restore transaction mock for this test
    // @ts-expect-error
    prisma.$transaction = async (ops: any[]) => {
      const results = [];
      for (const op of ops) {
        if (op === 'mocked_upsert') results.push({ id: 'user-1' });
        else if (op === 'mocked_order') results.push({ id: 'order-1' });
        else results.push(await op);
      }
      return results;
    };

    productsDb = [
      { id: "p1", name: "P1", price: 10, mrp: 15, unit: "kg", image: "img", isAvailable: false }
    ];

    try {
      await createOrder({
        userId: "u1",
        address,
        paymentMethod: "cash",
        items: [
          { productId: "p1", quantity: 1 }
        ]
      });
      assert.fail("Should have thrown error for unavailable product");
    } catch (e: any) {
      assert(e.message.includes("is currently unavailable"), "Error message should mention unavailable product");
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

runTests().catch(e => {
  console.error("Test failed:", e);
  process.exit(1);
});
