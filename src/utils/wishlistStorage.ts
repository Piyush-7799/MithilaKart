/**
 * Safe localStorage persistence utility for MithilaKart Wishlist / Favourites.
 * Stores only valid product IDs with defensive parsing and graceful corruption recovery.
 */

export const WISHLIST_STORAGE_KEY = "mithilakart_wishlist_v1";

/**
 * Loads and sanitizes wishlist data from localStorage.
 *
 * @param validProductIds Optional set of valid product IDs to filter out obsolete/corrupted entries.
 * @returns An array of unique, valid product IDs.
 */
export function loadWishlist(validProductIds?: Set<string>): string[] {
  if (typeof window === "undefined" || !window.localStorage) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    // Validate that parsed value is an array
    if (!Array.isArray(parsed)) {
      console.warn("Invalid wishlist data structure in localStorage. Resetting.");
      clearWishlist();
      return [];
    }

    const sanitizedSet = new Set<string>();

    for (const item of parsed) {
      // Must be a non-empty string
      if (typeof item !== "string") {
        continue;
      }
      const trimmed = item.trim();
      if (!trimmed) {
        continue;
      }

      // If valid product IDs set is provided, verify ID exists in catalogue
      if (validProductIds && !validProductIds.has(trimmed)) {
        continue;
      }

      sanitizedSet.add(trimmed);
    }

    return Array.from(sanitizedSet);
  } catch (error) {
    console.error("Error reading wishlist from localStorage, resetting to empty:", error);
    clearWishlist();
    return [];
  }
}

/**
 * Saves a list of product IDs to localStorage.
 */
export function saveWishlist(wishlist: string[]): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    // Deduplicate and filter non-strings
    const unique = Array.from(new Set(wishlist.filter((id) => typeof id === "string" && id.trim() !== "")));
    window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(unique));
  } catch (error) {
    console.error("Error saving wishlist to localStorage:", error);
  }
}

/**
 * Helper to add a product ID to localStorage wishlist.
 */
export function addToWishlist(productId: string): string[] {
  const current = loadWishlist();
  if (!current.includes(productId)) {
    const updated = [...current, productId];
    saveWishlist(updated);
    return updated;
  }
  return current;
}

/**
 * Helper to remove a product ID from localStorage wishlist.
 */
export function removeFromWishlist(productId: string): string[] {
  const current = loadWishlist();
  const updated = current.filter((id) => id !== productId);
  saveWishlist(updated);
  return updated;
}

/**
 * Clears the stored wishlist from localStorage.
 */
export function clearWishlist(): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    window.localStorage.removeItem(WISHLIST_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing wishlist from localStorage:", error);
  }
}
