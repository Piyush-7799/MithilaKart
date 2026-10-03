/**
 * MithilaKart Admin Storage Utility
 * Versioned local persistence for admin operations (product availability overrides, etc.)
 * Strictly defensive against malformed JSON and missing browser storage.
 */

export const ADMIN_PRODUCT_STATE_KEY = "mithilakart_admin_product_state_v1";

export interface ProductOverrideState {
  isAvailable: boolean;
  updatedAt?: string;
}

export type AdminProductOverrides = Record<string, ProductOverrideState>;

/**
 * Loads all product availability overrides from localStorage.
 * Guaranteed to return a valid Record without crashing on corrupted data.
 */
export function getAdminProductOverrides(): AdminProductOverrides {
  if (typeof window === "undefined" || !window.localStorage) {
    return {};
  }

  try {
    const raw = localStorage.getItem(ADMIN_PRODUCT_STATE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return {};
    }

    const cleaned: AdminProductOverrides = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof key === "string" && value && typeof value === "object") {
        const valObj = value as Record<string, unknown>;
        if (typeof valObj.isAvailable === "boolean") {
          cleaned[key] = {
            isAvailable: valObj.isAvailable,
            updatedAt: typeof valObj.updatedAt === "string" ? valObj.updatedAt : undefined,
          };
        }
      }
    }
    return cleaned;
  } catch (err) {
    console.warn("MithilaKart Admin: Failed to read product overrides from localStorage", err);
    return {};
  }
}

/**
 * Sets availability override for a specific product.
 */
export function setProductAvailability(productId: string, isAvailable: boolean): AdminProductOverrides {
  if (typeof window === "undefined" || !window.localStorage) {
    return {};
  }

  try {
    const current = getAdminProductOverrides();
    const updated: AdminProductOverrides = {
      ...current,
      [productId]: {
        isAvailable,
        updatedAt: new Date().toISOString(),
      },
    };

    localStorage.setItem(ADMIN_PRODUCT_STATE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn("MithilaKart Admin: Failed to save product availability to localStorage", err);
    return getAdminProductOverrides();
  }
}

/**
 * Checks if a product is available, considering admin overrides.
 * By default, products without an override are considered available (true).
 */
export function isProductAvailable(
  productId: string,
  overrides?: AdminProductOverrides
): boolean {
  const activeOverrides = overrides || getAdminProductOverrides();
  if (productId in activeOverrides) {
    return activeOverrides[productId].isAvailable;
  }
  return true;
}

/**
 * Resets all product availability overrides back to catalogue defaults.
 */
export function resetAdminProductOverrides(): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    localStorage.removeItem(ADMIN_PRODUCT_STATE_KEY);
  } catch (err) {
    console.warn("MithilaKart Admin: Failed to clear product overrides from localStorage", err);
  }
}
