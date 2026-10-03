import type { Order, OrderStatus, DeliveryLocation, AddressSnapshot } from "../types";

export const ORDERS_STORAGE_KEY = "mithilakart_orders_v1";

/**
 * Generates a unique client-side order ID.
 * Format: MK-YYYYMMDD-XXXX (e.g. MK-20261003-4821)
 */
export function generateOrderId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const dateStr = `${year}${month}${day}`;

  // 4-digit cryptographically-informed / safe numeric suffix
  const randNum = Math.floor(1000 + Math.random() * 9000);
  return `MK-${dateStr}-${randNum}`;
}

/**
 * Creates an immutable snapshot of a delivery address or location.
 */
export function createAddressSnapshot(location: DeliveryLocation): AddressSnapshot {
  if (location.address) {
    return {
      id: location.address.id,
      fullName: location.address.fullName,
      phone: location.address.phone,
      house: location.address.house,
      street: location.address.street,
      city: location.address.city,
      state: location.address.state,
      pincode: location.address.pincode,
      landmark: location.address.landmark,
      label: location.address.label,
      displayName: location.displayName,
    };
  }

  return {
    fullName: "Valued Customer",
    phone: "",
    house: "",
    street: location.displayName,
    city: location.city,
    state: location.state,
    pincode: location.pincode || "",
    label: location.label || "Delivery Location",
    displayName: location.displayName,
  };
}

/**
 * Retrieves all stored orders, sorted newest first.
 * Safely handles corrupted JSON and missing storage.
 */
export function getOrders(): Order[] {
  if (typeof window === "undefined" || !window.localStorage) {
    return [];
  }

  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Filter valid orders and sort newest first by createdAt
    const validOrders: Order[] = parsed.filter(
      (item) => item && typeof item === "object" && typeof item.id === "string"
    );

    return validOrders.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return timeB - timeA;
    });
  } catch (err) {
    console.warn("MithilaKart: Failed to read orders from localStorage", err);
    return [];
  }
}

/**
 * Finds a single order by its unique ID.
 */
export function getOrderById(id: string): Order | null {
  const orders = getOrders();
  return orders.find((o) => o.id === id) || null;
}

/**
 * Persists an order into localStorage.
 * If the order already exists, updates it. Otherwise, prepends it.
 */
export function saveOrder(order: Order): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    const orders = getOrders();
    const existingIndex = orders.findIndex((o) => o.id === order.id);

    let updated: Order[];
    if (existingIndex >= 0) {
      updated = [...orders];
      updated[existingIndex] = order;
    } else {
      updated = [order, ...orders];
    }

    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("MithilaKart: Failed to save order to localStorage", err);
  }
}

export interface CreateOrderParams {
  items: Order["items"];
  subtotal: number;
  deliveryFee: number;
  total: number;
  savings: number;
  deliveryEta: string;
  address: AddressSnapshot;
  paymentMethod?: string;
  notes?: string;
}

/**
 * Creates and persists a new Order with initial "Placed" status.
 */
export function createOrder(params: CreateOrderParams): Order {
  const newOrder: Order = {
    id: generateOrderId(),
    createdAt: new Date().toISOString(),
    status: "Placed" as OrderStatus,
    items: params.items,
    subtotal: params.subtotal,
    deliveryFee: params.deliveryFee,
    total: params.total,
    savings: params.savings,
    deliveryEta: params.deliveryEta,
    address: params.address,
    paymentMethod: params.paymentMethod || "Cash on Delivery",
    estimatedDelivery: params.deliveryEta,
    notes: params.notes,
  };

  saveOrder(newOrder);
  return newOrder;
}

/**
 * Clears all orders from storage (for testing/development).
 */
export function clearOrders(): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    localStorage.removeItem(ORDERS_STORAGE_KEY);
  } catch (err) {
    console.warn("MithilaKart: Failed to clear orders from localStorage", err);
  }
}
