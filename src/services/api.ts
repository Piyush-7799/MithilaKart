/**
 * src/services/api.ts
 *
 * Typed API client for the MithilaKart backend.
 * Reads VITE_API_URL from .env — never contains secrets.
 *
 * Phase 23.2: Product read operations only.
 * Orders, users, addresses remain on localStorage (Phase 23.3+).
 */

import type { Product, Order } from "../types";

// ── Config ────────────────────────────────────────────────────────────────────

const API_BASE = (import.meta.env["VITE_API_URL"] as string | undefined) ?? "http://localhost:4000/api";

/** Timeout for all API calls — prevents hanging UI on slow connections */
const REQUEST_TIMEOUT_MS = 8000;

// ── Shared fetch helper ───────────────────────────────────────────────────────

async function apiFetch<T>(path: string, signal?: AbortSignal): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    signal,
  });

  if (!response.ok) {
    throw new Error(`API ${response.status}: ${response.statusText} — ${url}`);
  }

  const data = (await response.json()) as unknown;

  if (
    typeof data !== "object" ||
    data === null ||
    (data as Record<string, unknown>)["status"] === "error"
  ) {
    const msg = (data as Record<string, unknown>)["message"];
    throw new Error(typeof msg === "string" ? msg : "Unexpected API response");
  }

  return data as T;
}

// ── API response shapes ───────────────────────────────────────────────────────

/** Shape of a product as returned by the backend (Prisma model) */
interface ApiProduct {
  id: string;
  name: string;
  price: number;
  mrp: number;
  unit: string;
  category: string;
  rating: number;
  delivery: string;
  image: string;
  fallbackIcon: string | null;
  badge: string | null;
  isMithilaSpecial: boolean;
  description: string | null;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiProductListResponse {
  status: "ok";
  total: number;
  limit: number;
  offset: number;
  products: ApiProduct[];
}

interface ApiProductResponse {
  status: "ok";
  product: ApiProduct;
}

// ── Mapper — ApiProduct → frontend Product ────────────────────────────────────

/**
 * Maps the Prisma/API product shape to the frontend Product interface.
 * null → undefined conversions preserve existing frontend type expectations.
 */
function mapApiProduct(p: ApiProduct): Product {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    mrp: p.mrp,
    unit: p.unit,
    category: p.category,
    rating: p.rating,
    delivery: p.delivery,
    image: p.image,
    fallbackIcon: p.fallbackIcon ?? undefined,
    badge: p.badge ?? undefined,
    isMithilaSpecial: p.isMithilaSpecial,
    description: p.description ?? undefined,
  };
}

// ── Public API functions ──────────────────────────────────────────────────────

export interface ProductListParams {
  search?: string;
  category?: string;
  available?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Fetch all products from the backend.
 * Supports optional search, category, available filters.
 * Default limit is 200 — covers the full catalogue (currently 126 products).
 */
export async function fetchProducts(
  params: ProductListParams = {},
  signal?: AbortSignal
): Promise<Product[]> {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.category) qs.set("category", params.category);
  if (params.available !== undefined) qs.set("available", String(params.available));
  qs.set("limit", String(params.limit ?? 200));
  if (params.offset) qs.set("offset", String(params.offset));

  const path = `/products?${qs.toString()}`;
  const data = await apiFetch<ApiProductListResponse>(path, signal);
  return data.products.map(mapApiProduct);
}

/**
 * Fetch a single product by ID.
 * Returns null if the product is not found (404).
 */
export async function fetchProductById(
  id: string,
  signal?: AbortSignal
): Promise<Product | null> {
  try {
    const data = await apiFetch<ApiProductResponse>(`/products/${encodeURIComponent(id)}`, signal);
    return mapApiProduct(data.product);
  } catch (err) {
    if (err instanceof Error && err.message.includes("API 404")) return null;
    throw err;
  }
}

async function apiPost<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    throw new Error(`API ${response.status}: ${response.statusText} — ${url}`);
  }

  const data = (await response.json()) as unknown;

  if (
    typeof data !== "object" ||
    data === null ||
    (data as Record<string, unknown>)["status"] === "error"
  ) {
    const msg = (data as Record<string, unknown>)["message"];
    throw new Error(typeof msg === "string" ? msg : "Unexpected API response");
  }

  return data as T;
}

export interface CreateOrderRequest {
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
}

export async function createOrder(
  req: CreateOrderRequest,
  signal?: AbortSignal
) {
  return await apiPost<{ status: "ok"; order: Order }>("/orders", req, signal);
}

export async function fetchOrders(
  userId?: string,
  signal?: AbortSignal
) {
  const qs = userId ? `?userId=${encodeURIComponent(userId)}` : "";
  const path = `/orders${qs}`;
  const data = await apiFetch<{ status: "ok"; orders: Order[] }>(path, signal);
  return data.orders;
}

export async function fetchOrderById(
  id: string,
  signal?: AbortSignal
) {
  const data = await apiFetch<{ status: "ok"; order: Order }>(`/orders/${encodeURIComponent(id)}`, signal);
  return data.order;
}

/** Exported for use in the useProducts hook */
export { REQUEST_TIMEOUT_MS };
