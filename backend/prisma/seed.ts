/**
 * backend/prisma/seed.ts
 *
 * Seeds the MithilaKart PostgreSQL database with the canonical product
 * catalogue from src/data/products.ts.
 *
 * Design decisions:
 *  - Single source of truth: PRODUCTS array in src/data/products.ts
 *  - Upsert on product id → idempotent, safe to run multiple times
 *  - Never deletes existing products or orders
 *  - Sets isAvailable = true for new products (preserves existing DB values)
 *  - Reads DATABASE_URL from backend/.env via dotenv
 *
 * Usage (from backend/ directory):
 *   npx tsx prisma/seed.ts
 *   — or —
 *   npm run db:seed
 *
 * Run with tsx so TypeScript imports work without pre-compilation.
 * The import path goes up two levels: backend/prisma/ → backend/ → repo root → src/
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

// Direct TypeScript import — works because tsx handles .ts files natively.
// Path: backend/prisma/seed.ts → ../../src/data/products
import { PRODUCTS } from "../../src/data/products";

const prisma = new PrismaClient({
  log: ["warn", "error"],
});

async function main() {
  console.log(`\n🌱 MithilaKart Seed Script`);
  console.log(`   Source    : src/data/products.ts`);
  console.log(`   Products  : ${PRODUCTS.length} to upsert`);
  console.log(`   Database  : Neon PostgreSQL\n`);

  let seeded = 0;
  let errors = 0;

  for (const product of PRODUCTS) {
    try {
      await prisma.product.upsert({
        where: { id: product.id },
        // UPDATE: sync all catalogue fields, but do NOT touch isAvailable
        // so any admin overrides already in DB are preserved.
        update: {
          name: product.name,
          price: product.price,
          mrp: product.mrp,
          unit: product.unit,
          category: product.category,
          rating: product.rating,
          delivery: product.delivery,
          image: product.image,
          fallbackIcon: product.fallbackIcon ?? null,
          badge: product.badge ?? null,
          isMithilaSpecial: product.isMithilaSpecial ?? false,
          description: product.description ?? null,
        },
        // CREATE: insert fresh record with isAvailable = true
        create: {
          id: product.id,
          name: product.name,
          price: product.price,
          mrp: product.mrp,
          unit: product.unit,
          category: product.category,
          rating: product.rating,
          delivery: product.delivery,
          image: product.image,
          fallbackIcon: product.fallbackIcon ?? null,
          badge: product.badge ?? null,
          isMithilaSpecial: product.isMithilaSpecial ?? false,
          description: product.description ?? null,
          isAvailable: true,
        },
      });
      seeded++;
      process.stdout.write(`\r   ✅ Upserted ${seeded}/${PRODUCTS.length} products...`);
    } catch (err) {
      errors++;
      console.error(`\n   ❌ Failed: "${product.id}" —`, (err as Error).message);
    }
  }

  // Final count from DB to confirm
  const dbCount = await prisma.product.count();

  console.log(`\n\n📊 Seed Results`);
  console.log(`   ─────────────────────────────`);
  console.log(`   Upserted   : ${seeded} products`);
  console.log(`   Errors     : ${errors}`);
  console.log(`   DB total   : ${dbCount} products`);
  console.log(`   ─────────────────────────────\n`);

  if (errors > 0) {
    console.error(`[Seed] ${errors} product(s) failed to seed.`);
    process.exit(1);
  }

  if (dbCount < PRODUCTS.length) {
    console.warn(
      `[Seed] Warning: DB has ${dbCount} products but source has ${PRODUCTS.length}.`
    );
  }

  console.log(`✅ Seed complete — all ${seeded} products are in the database.\n`);
}

main()
  .catch((err) => {
    console.error("\n[Seed] Fatal error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
