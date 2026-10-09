/**
 * src/services/api.ts
 *
 * Typed API client for the MithilaKart backend.
 * Reads VITE_API_URL from .env — never contains secrets.
 *
 * Phase 23.2: Product read operations only.
 * Orders, users, addresses remain on localStorage (Phase 23.3+).
 */

import type { Product } from "../types";

// ── Config ────────────────────────────────────────────────────────────────────

const API_BASE = (import.meta.env["VITE_API_URL"] as string | undefined) ?? "http://localhost:4000/api";

/** Timeout for all API calls — prevents hanging UI on slow connections */
const REQUEST_TIMEOUT_MS = 15000;

// ── Shared fetch helper ───────────────────────────────────────────────────────

function getAuthHeaders() {
  return { "Content-Type": "application/json" };
}

async function fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(new Error("Request timeout")), REQUEST_TIMEOUT_MS);

  let abortHandler: (() => void) | undefined;

  if (options.signal) {
    if (options.signal.aborted) {
      controller.abort(options.signal.reason);
    } else {
      abortHandler = () => controller.abort(options.signal?.reason);
      options.signal.addEventListener("abort", abortHandler);
    }
  }

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.message === "Request timeout") {
      throw new Error("Request timed out. Please check your connection and try again.", { cause: error });
    }
    throw error;
  } finally {
    clearTimeout(id);
    if (options.signal && abortHandler) {
      options.signal.removeEventListener("abort", abortHandler);
    }
  }
}

async function apiFetch<T>(path: string, signal?: AbortSignal): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetchWithTimeout(url, {
    headers: getAuthHeaders(),
    credentials: "include",
    signal,
  });

  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("mithilakart:auth-expired"));
      }
    }
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
interface ApiOrderItem {
  productId: string;
  nameSnapshot: string;
  imageSnapshot: string;
  quantity: number;
  priceSnapshot: number;
  mrpSnapshot?: number | null;
  unitSnapshot?: string | null;
  lineTotal: number;
}

interface ApiOrder {
  items: ApiOrderItem[];
  addressFullName: string;
  addressPhone: string;
  addressHouse: string;
  addressStreet: string;
  addressCity: string;
  addressState: string;
  addressPincode: string;
  addressLandmark?: string | null;
  addressLabel?: string | null;
  addressDisplay?: string | null;
  [key: string]: unknown;
}

function mapApiOrder(apiOrder: ApiOrder): import("../types").Order {
  return {
    ...(apiOrder as unknown as import("../types").Order),
    items: apiOrder.items?.map((item) => ({
      productId: item.productId,
      name: item.nameSnapshot,
      image: item.imageSnapshot,
      quantity: item.quantity,
      price: item.priceSnapshot,
      mrp: item.mrpSnapshot || undefined,
      unit: item.unitSnapshot || undefined,
      lineTotal: item.lineTotal,
    })) || [],
    address: {
      fullName: apiOrder.addressFullName,
      phone: apiOrder.addressPhone,
      house: apiOrder.addressHouse,
      street: apiOrder.addressStreet,
      city: apiOrder.addressCity,
      state: apiOrder.addressState,
      pincode: apiOrder.addressPincode,
      landmark: apiOrder.addressLandmark || undefined,
      label: apiOrder.addressLabel || "",
      displayName: apiOrder.addressDisplay || undefined,
    }
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

async function apiPost<T>(path: string, body: unknown, signal?: AbortSignal, extraHeaders?: Record<string, string>): Promise<T> {
  const url = `${API_BASE}${path}`;
  const headers = getAuthHeaders();
  if (extraHeaders) {
    Object.assign(headers, extraHeaders);
  }
  const response = await fetchWithTimeout(url, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("mithilakart:auth-expired"));
      }
    }
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

async function apiPut<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetchWithTimeout(url, {
    method: "PUT",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("mithilakart:auth-expired"));
      }
    }
    throw new Error(`API ${response.status}: ${response.statusText}`);
  }
  const data = (await response.json()) as unknown;
  if (typeof data !== "object" || data === null || (data as Record<string, unknown>)["status"] === "error") {
    throw new Error("API Error");
  }
  return data as T;
}

async function apiDelete<T>(path: string, signal?: AbortSignal): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetchWithTimeout(url, {
    method: "DELETE",
    headers: getAuthHeaders(),
    credentials: "include",
    signal,
  });

  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("mithilakart:auth-expired"));
      }
    }
    throw new Error(`API ${response.status}: ${response.statusText}`);
  }
  const data = (await response.json()) as unknown;
  if (typeof data !== "object" || data === null || (data as Record<string, unknown>)["status"] === "error") {
    throw new Error("API Error");
  }
  return data as T;
}

export interface CreateOrderRequest {
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

export async function createOrder(
  req: CreateOrderRequest,
  signal?: AbortSignal
) {
  const extraHeaders: Record<string, string> = {};
  if (req.idempotencyKey) {
    extraHeaders["X-Idempotency-Key"] = req.idempotencyKey;
  }
  const data = await apiPost<{ status: "ok"; order: ApiOrder }>("/orders", req, signal, extraHeaders);
  return { ...data, order: mapApiOrder(data.order) };
}

export async function fetchOrders(
  signal?: AbortSignal
) {
  const path = `/orders`;
  const data = await apiFetch<{ status: "ok"; orders: ApiOrder[] }>(path, signal);
  return data.orders.map(mapApiOrder);
}

export async function fetchOrderById(
  id: string,
  signal?: AbortSignal
) {
  const data = await apiFetch<{ status: "ok"; order: ApiOrder }>(`/orders/${encodeURIComponent(id)}`, signal);
  return mapApiOrder(data.order);
}

export async function apiUpdateOrderStatus(
  id: string,
  status: string,
  signal?: AbortSignal
) {
  const data = await apiPut<{ status: "ok"; order: ApiOrder }>(
    `/orders/${encodeURIComponent(id)}/status`,
    { status },
    signal
  );
  return mapApiOrder(data.order);
}

/** Exported for use in the useProducts hook */
export { REQUEST_TIMEOUT_MS };

// ── Auth APIs ─────────────────────────────────────────────────────────────────

export async function loginUser(email: string, password: string) {
  return await apiPost<{ status: "ok"; user: import("../types").UserProfile }>("/auth/login", { email, password });
}

export async function registerUser(fullName: string, email: string, password: string) {
  return await apiPost<{ status: "ok"; user: import("../types").UserProfile }>("/auth/register", { fullName, email, password });
}

export async function logoutUser() {
  return await apiPost<{ status: "ok" }>("/auth/logout", {});
}

export async function fetchCurrentUser(signal?: AbortSignal) {
  return await apiFetch<{ status: "ok"; user: import("../types").UserProfile }>("/auth/me", signal);
}

// ── Address APIs ───────────────────────────────────────────────────────────────

export async function fetchAddresses(signal?: AbortSignal) {
  const data = await apiFetch<{ status: "ok"; addresses: import("../types").Address[] }>("/addresses", signal);
  return data.addresses;
}

export async function createAddress(address: Omit<import("../types").Address, "id" | "userId" | "createdAt" | "updatedAt">) {
  const data = await apiPost<{ status: "ok"; address: import("../types").Address }>("/addresses", address);
  return data.address;
}

export async function updateAddress(id: string, address: Partial<import("../types").Address>) {
  const data = await apiPut<{ status: "ok"; address: import("../types").Address }>(`/addresses/${id}`, address);
  return data.address;
}

export async function deleteAddress(id: string) {
  await apiDelete<{ status: "ok" }>(`/addresses/${id}`);
}
