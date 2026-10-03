import type { CartItem, DeliveryEtaInfo, DeliveryLocation } from "../types";

/**
 * Parses a delivery time string (e.g., "10-15 min", "15 min", "10-15 mins")
 * into numeric lower and upper minute bounds.
 */
function parseDeliveryMinutes(deliveryStr: string): { min: number; max: number } {
  if (!deliveryStr || typeof deliveryStr !== "string") {
    return { min: 10, max: 15 };
  }

  const match = deliveryStr.match(/(\d+)(?:\s*[-–]\s*(\d+))?/);
  if (!match) {
    return { min: 10, max: 15 };
  }

  const first = parseInt(match[1], 10);
  const second = match[2] ? parseInt(match[2], 10) : first;

  const min = Math.min(first, second);
  const max = Math.max(first, second);

  return {
    min: isNaN(min) ? 10 : min,
    max: isNaN(max) ? 15 : max,
  };
}

/**
 * Derives one deterministic, explainable delivery estimate for the cart.
 * If product delivery windows differ, it uses the safest/slowest window
 * so customer expectations are never misaligned with what the cart can support.
 */
export function calculateCartDeliveryEta(
  cartItems: CartItem[],
  selectedLocation: DeliveryLocation | null
): DeliveryEtaInfo {
  if (!cartItems || cartItems.length === 0) {
    return {
      etaText: "10–15 mins",
      minMinutes: 10,
      maxMinutes: 15,
      serviceabilityStatus: selectedLocation ? "Delivery available" : "Select address",
      reason: "Fast delivery across Mithila",
    };
  }

  let slowestMin = 10;
  let slowestMax = 15;

  for (const item of cartItems) {
    const { min, max } = parseDeliveryMinutes(item.product.delivery);
    if (min > slowestMin) slowestMin = min;
    if (max > slowestMax) slowestMax = max;
  }

  const etaText =
    slowestMin === slowestMax ? `${slowestMax} mins` : `${slowestMin}–${slowestMax} mins`;

  const serviceabilityStatus = selectedLocation
    ? "Delivery available"
    : "Select address";

  const reason = "Fast delivery across Mithila";

  return {
    etaText,
    minMinutes: slowestMin,
    maxMinutes: slowestMax,
    serviceabilityStatus,
    reason,
  };
}
