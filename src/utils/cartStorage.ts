/**
 * Safe localStorage persistence utility for MithilaKart Cart.
 * Includes defensive parsing, validation against known products, and graceful fallback.
 */

export const CART_STORAGE_KEY = "mithilakart_cart_v1";

/**
 * Loads and sanitizes cart data from localStorage.
 *
 * @param validProductIds Optional set of valid product IDs to filter out obsolete/corrupted entries.
 * @returns A safe Record<string, number> of product ID to positive integer quantity.
 */
export function loadSavedCart(validProductIds?: Set<string>): Record<string, number> {
  if (typeof window === "undefined" || !window.localStorage) {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);

    // Validate that parsed value is a plain object and not an array, null, or primitive
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      console.warn("Invalid cart data structure found in localStorage. Resetting cart.");
      clearSavedCart();
      return {};
    }

    const sanitized: Record<string, number> = {};

    for (const [key, value] of Object.entries(parsed)) {
      // Key must be a non-empty string
      if (typeof key !== "string" || key.trim() === "") {
        continue;
      }

      // If valid product IDs are provided, verify the key exists in catalogue
      if (validProductIds && !validProductIds.has(key)) {
        continue;
      }

      // Quantity must be a positive integer between 1 and 99
      const numValue = Number(value);
      if (
        typeof value === "number" &&
        Number.isInteger(numValue) &&
        numValue > 0 &&
        numValue <= 99
      ) {
        sanitized[key] = numValue;
      }
    }

    return sanitized;
  } catch (error) {
    console.warn("Error reading or parsing cart from localStorage. Resetting cart:", error);
    clearSavedCart();
    return {};
  }
}

/**
 * Safely persists cart to localStorage.
 *
 * @param cart The current cart state.
 */
export function saveCart(cart: Record<string, number>): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    const keys = Object.keys(cart);
    if (keys.length === 0) {
      // Remove key if cart is empty to avoid stale empty records
      window.localStorage.removeItem(CART_STORAGE_KEY);
    } else {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  } catch (error) {
    console.warn("Failed to save cart to localStorage:", error);
  }
}

/**
 * Clears the stored cart from localStorage safely.
 */
export function clearSavedCart(): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    window.localStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to remove cart from localStorage:", error);
  }
}
