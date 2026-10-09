/**
 * src/hooks/useProducts.ts
 *
 * Fetches the full product catalogue from the backend API once on mount.
 * Falls back to the static PRODUCTS array if the API is unavailable.
 *
 * Key behaviours:
 *  - Single fetch on mount — no unnecessary re-fetching
 *  - AbortController cancels in-flight request on unmount
 *  - 8-second timeout prevents hanging UI
 *  - On any error (network, 503, timeout): falls back to static PRODUCTS
 *  - Exposes { products, isLoading, isApiConnected, error }
 */

import { useState, useEffect, useRef } from "react";
import { PRODUCTS as STATIC_PRODUCTS } from "../data/products";
import { fetchProducts, REQUEST_TIMEOUT_MS } from "../services/api";
import type { Product } from "../types";

export type ProductSource = "api" | "static";

export interface UseProductsResult {
  /** The product array — from API or static fallback */
  products: Product[];
  /** True while the initial fetch is in-flight */
  isLoading: boolean;
  /** True once the API fetch succeeded */
  isApiConnected: boolean;
  /** Source of current data */
  source: ProductSource;
  /** Human-readable error message if fetch failed */
  error: string | null;
  /** Update a specific product in local state */
  updateProduct: (id: string, updates: Partial<Product>) => void;
}

export function useProducts(): UseProductsResult {
  const [products, setProducts] = useState<Product[]>(STATIC_PRODUCTS);
  const [isLoading, setIsLoading] = useState(true);
  const [isApiConnected, setIsApiConnected] = useState(false);
  const [source, setSource] = useState<ProductSource>("static");
  const [error, setError] = useState<string | null>(null);

  // Ref to track mount status — prevents state updates after unmount
  const isMounted = useRef(true);

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  useEffect(() => {
    isMounted.current = true;
    const controller = new AbortController();

    // Timeout guard: abort if API doesn't respond within threshold
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

    async function loadProducts() {
      try {
        const apiProducts = await fetchProducts({}, controller.signal);

        if (!isMounted.current) return;

        if (apiProducts.length === 0) {
          // API returned empty catalogue — fall back to static data
          console.warn(
            "[MithilaKart] API returned 0 products — using static catalogue as fallback."
          );
          setProducts(STATIC_PRODUCTS);
          setSource("static");
          setError("API returned an empty catalogue. Showing local data.");
          setIsApiConnected(false);
        } else {
          setProducts(apiProducts);
          setSource("api");
          setIsApiConnected(true);
          setError(null);
          console.info(
            `[MithilaKart] Loaded ${apiProducts.length} products from API.`
          );
        }
      } catch (err) {
        if (!isMounted.current) return;

        // AbortError = timeout or unmount — not a real error to show the user
        if (err instanceof Error && err.name === "AbortError") {
          console.warn("[MithilaKart] Product API request timed out — using static catalogue.");
          setError("Backend took too long to respond. Showing local data.");
        } else {
          const msg = err instanceof Error ? err.message : "Unknown error";
          console.warn("[MithilaKart] Product API unavailable —", msg, "— using static catalogue.");
          setError("Backend unavailable. Showing local catalogue.");
        }

        // Always fall back to static data on failure — app stays functional
        setProducts(STATIC_PRODUCTS);
        setSource("static");
        setIsApiConnected(false);
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
        clearTimeout(timeoutId);
      }
    }

    void loadProducts();

    return () => {
      isMounted.current = false;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, []); // Empty dep array — fetch once on mount only

  return { products, isLoading, isApiConnected, source, error, updateProduct };
}
