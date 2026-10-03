# MithilaKart Backend — Developer Guide

## Overview

This is the **Node.js + Express + TypeScript + Prisma + PostgreSQL** backend for MithilaKart.

> **Phase 23.1 — Foundation only.**
> The frontend still uses `localStorage` for all data. This backend runs _alongside_ the existing frontend and does not yet replace any frontend behaviour. Phase 23.2 will introduce incremental frontend API integration.

---

## Directory Structure

```
backend/
├── prisma/
│   └── schema.prisma         # Prisma schema (all domain models)
├── src/
│   ├── config/
│   │   └── env.ts            # Centralised environment variable access
│   ├── lib/
│   │   └── prisma.ts         # Prisma singleton client
│   ├── middleware/
│   │   ├── errorHandler.ts   # Centralised error handler (no stack traces in prod)
│   │   └── notFound.ts       # 404 catch-all
│   ├── routes/
│   │   ├── health.ts
│   │   ├── products.ts
│   │   ├── orders.ts
│   │   ├── users.ts
│   │   └── addresses.ts
│   ├── controllers/
│   │   ├── healthController.ts
│   │   ├── productController.ts
│   │   ├── orderController.ts
│   │   └── userController.ts
│   ├── services/
│   │   ├── healthService.ts  # Real DB connection check
│   │   ├── productService.ts
│   │   ├── orderService.ts
│   │   └── userService.ts
│   ├── app.ts                # Express app factory
│   └── server.ts             # Entry point + graceful shutdown
├── .env.example              # Template — copy to .env and fill in values
├── .gitignore                # Excludes .env, dist/, node_modules/
├── package.json
└── tsconfig.json
```

---

## Environment Variables

Copy `.env.example` → `.env` and fill in real values. **Never commit `.env`.**

| Variable       | Required  | Example                                                  | Notes                                    |
|----------------|-----------|----------------------------------------------------------|------------------------------------------|
| `DATABASE_URL` | Yes (prod)| `postgresql://user:pass@localhost:5432/mithilakart?schema=public` | PostgreSQL connection string |
| `PORT`         | No        | `4000`                                                   | Defaults to 4000                         |
| `CLIENT_URL`   | No        | `http://localhost:5173`                                  | CORS allowed origin (Vite frontend)      |
| `NODE_ENV`     | No        | `development`                                            | `development` \| `production` \| `test`  |

> `DATABASE_URL` is **never** in any `VITE_*` variable and is **never** sent to the browser.

---

## Starting the Backend

### From the backend directory

```bash
cd backend
npm install
npm run dev          # Development: tsx watch (hot reload)
npm run start        # Production: compiled JS
```

### From the project root

```bash
npm run server:install   # Install backend deps
npm run server:dev       # Start in dev mode (hot reload)
npm run server           # Start production build
```

The **frontend** is unaffected — keep running `npm run dev` as always.

---

## Prisma Commands

| Command                      | Purpose                                       |
|------------------------------|-----------------------------------------------|
| `npm run db:validate`        | Validate schema without a DB connection       |
| `npm run db:generate`        | Generate Prisma Client from schema            |
| `npm run db:migrate`         | Create + apply a new migration (dev)          |
| `npm run db:migrate:prod`    | Apply pending migrations (production)         |
| `npm run db:studio`          | Open Prisma Studio (GUI)                      |
| `npm run db:reset`           | Reset DB + re-apply all migrations (dev only) |

### Initial database setup

```bash
# 1. Create a PostgreSQL database named 'mithilakart'
createdb mithilakart

# 2. Set DATABASE_URL in backend/.env

# 3. Generate Prisma Client
npm run db:generate

# 4. Create and apply the initial migration
npm run db:migrate
# Enter a name when prompted, e.g.: "init"

# 5. Verify via Studio
npm run db:studio
```

---

## API Endpoints

Base URL: `http://localhost:4000`

### Health

| Method | Path              | Description                         |
|--------|-------------------|-------------------------------------|
| `GET`  | `/api/health`     | Liveness check — always 200         |
| `GET`  | `/api/health/db`  | DB connectivity — 200 or 503        |

**`/api/health` response (always ok):**
```json
{ "status": "ok", "service": "mithilakart-api", "timestamp": "..." }
```

**`/api/health/db` when connected:**
```json
{ "status": "ok", "database": "connected", "timestamp": "..." }
```

**`/api/health/db` when unavailable:**
```json
{ "status": "error", "database": "unavailable", "timestamp": "...", "message": "..." }
```

### Products

| Method | Path                | Query Params                            | Description          |
|--------|---------------------|-----------------------------------------|----------------------|
| `GET`  | `/api/products`     | `?search=` `?category=` `?available=`  | List products        |
| `GET`  | `/api/products/:id` |                                         | Single product       |

Examples:
```
GET /api/products?search=rice
GET /api/products?category=Mithila Specials
GET /api/products?available=true
GET /api/products?limit=10&offset=0
```

### Orders

| Method | Path               | Query Params              | Description    |
|--------|--------------------|---------------------------|----------------|
| `GET`  | `/api/orders`      | `?userId=` `?status=`     | List orders    |
| `GET`  | `/api/orders/:id`  |                           | Single order   |

### Users & Addresses

| Method | Path                  | Query Params   | Description          |
|--------|-----------------------|----------------|----------------------|
| `GET`  | `/api/users/:id`      |                | User profile         |
| `GET`  | `/api/addresses`      | `?userId=`     | Addresses for user   |

---

## Current Limitations (Phase 23.1)

- **No frontend integration yet** — the frontend still reads/writes localStorage
- **No authentication** — endpoints are currently open (Phase 23.2+)
- **No write endpoints** — POST/PUT/PATCH/DELETE routes are Phase 23.2+
- **No database migration applied** — requires a running PostgreSQL instance
- **Database unavailable → 503** — all endpoints that touch Prisma return a clean 503 if the DB is unreachable; they never return fake data

---

## Prisma Domain Models

| Model       | Key fields                                               |
|-------------|----------------------------------------------------------|
| `User`      | id, fullName, email, phone, avatarUrl                    |
| `Address`   | id, userId, house, street, city, state, pincode, label   |
| `Product`   | id, name, price, mrp, unit, category, isAvailable        |
| `Order`     | id, userId, status (enum), subtotal, total, address snapshot |
| `OrderItem` | id, orderId, productId, nameSnapshot, priceSnapshot (immutable) |

Order statuses (enum): `Placed`, `Confirmed`, `Preparing`, `OutForDelivery`, `Delivered`, `Cancelled`
