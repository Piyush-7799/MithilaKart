import type { DeliveryLocation } from "../types";

export const LOCATION_STORAGE_KEY = "mithilakart_delivery_location_v1";
export const RECENT_LOCATIONS_KEY = "mithilakart_recent_locations_v1";

/**
 * Curated popular demo locations for Mithila / Bihar.
 * Note: These are selectable demo delivery destinations.
 */
export const POPULAR_LOCATIONS: DeliveryLocation[] = [
  {
    id: "loc-darbhanga",
    label: "Darbhanga",
    city: "Darbhanga",
    state: "Bihar",
    pincode: "846004",
    displayName: "Darbhanga, Bihar",
  },
  {
    id: "loc-madhubani",
    label: "Madhubani",
    city: "Madhubani",
    state: "Bihar",
    pincode: "847211",
    displayName: "Madhubani, Bihar",
  },
  {
    id: "loc-muzaffarpur",
    label: "Muzaffarpur",
    city: "Muzaffarpur",
    state: "Bihar",
    pincode: "842001",
    displayName: "Muzaffarpur, Bihar",
  },
  {
    id: "loc-patna",
    label: "Patna",
    city: "Patna",
    state: "Bihar",
    pincode: "800001",
    displayName: "Patna, Bihar",
  },
  {
    id: "loc-sitamarhi",
    label: "Sitamarhi",
    city: "Sitamarhi",
    state: "Bihar",
    pincode: "843302",
    displayName: "Sitamarhi, Bihar",
  },
];

/**
 * Validates whether an unknown object conforms to the DeliveryLocation schema.
 */
function isValidLocation(data: unknown): data is DeliveryLocation {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  return (
    typeof obj.id === "string" &&
    obj.id.trim() !== "" &&
    typeof obj.label === "string" &&
    obj.label.trim() !== "" &&
    typeof obj.city === "string" &&
    obj.city.trim() !== "" &&
    typeof obj.state === "string" &&
    obj.state.trim() !== "" &&
    typeof obj.displayName === "string" &&
    obj.displayName.trim() !== ""
  );
}

/**
 * Loads the saved delivery location from localStorage.
 * If invalid or corrupted data is detected, it safely clears the key and returns null.
 */
export function loadSavedLocation(): DeliveryLocation | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(LOCATION_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);

    if (!isValidLocation(parsed)) {
      console.warn("Corrupted or invalid location data in localStorage. Resetting.");
      clearSavedLocation();
      return null;
    }

    return parsed;
  } catch (error) {
    console.warn("Failed to parse location from localStorage. Resetting:", error);
    clearSavedLocation();
    return null;
  }
}

/**
 * Persists the selected location to localStorage and updates recent history.
 */
export function saveLocation(location: DeliveryLocation): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    window.localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));

    // Also update recent locations list (up to 3 distinct items)
    saveRecentLocation(location);
  } catch (error) {
    console.warn("Failed to save location to localStorage:", error);
  }
}

/**
 * Clears the active saved location from localStorage.
 */
export function clearSavedLocation(): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    window.localStorage.removeItem(LOCATION_STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear saved location from localStorage:", error);
  }
}

/**
 * Loads the list of recently selected locations.
 */
export function loadRecentLocations(): DeliveryLocation[] {
  if (typeof window === "undefined" || !window.localStorage) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(RECENT_LOCATIONS_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isValidLocation);
  } catch {
    return [];
  }
}

/**
 * Adds a location to the recent locations list in localStorage.
 */
function saveRecentLocation(location: DeliveryLocation): void {
  try {
    const recents = loadRecentLocations().filter((item) => item.id !== location.id);
    recents.unshift(location);
    const trimmed = recents.slice(0, 3);
    window.localStorage.setItem(RECENT_LOCATIONS_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn("Failed to update recent locations:", e);
  }
}
