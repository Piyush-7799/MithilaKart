import type { Address, DeliveryLocation } from "../types";

export const ADDRESS_STORAGE_KEY = "mithilakart_addresses_v1";
export const SELECTED_ADDRESS_KEY = "mithilakart_selected_address_id_v1";

/**
 * Validates an address object against the required schema.
 */
function isValidAddress(item: unknown): item is Address {
  if (typeof item !== "object" || item === null || Array.isArray(item)) {
    return false;
  }

  const candidate = item as Record<string, unknown>;

  const hasId = typeof candidate.id === "string" && candidate.id.trim() !== "";
  const hasName = typeof candidate.fullName === "string" && candidate.fullName.trim() !== "";
  const hasPhone = typeof candidate.phone === "string" && /^[6-9]\d{9}$/.test(candidate.phone.trim());
  const hasHouse = typeof candidate.house === "string" && candidate.house.trim() !== "";
  const hasStreet = typeof candidate.street === "string" && candidate.street.trim() !== "";
  const hasCity = typeof candidate.city === "string" && candidate.city.trim() !== "";
  const hasState = typeof candidate.state === "string" && candidate.state.trim() !== "";
  const hasPincode = typeof candidate.pincode === "string" && /^\d{6}$/.test(candidate.pincode.trim());
  const hasLabel =
    candidate.label === "Home" || candidate.label === "Work" || candidate.label === "Other";

  return (
    hasId &&
    hasName &&
    hasPhone &&
    hasHouse &&
    hasStreet &&
    hasCity &&
    hasState &&
    hasPincode &&
    hasLabel
  );
}

/**
 * Loads all saved addresses from localStorage with defensive parsing.
 */
export function loadSavedAddresses(): Address[] {
  if (typeof window === "undefined" || !window.localStorage) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(ADDRESS_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isValidAddress);
  } catch (err) {
    console.warn("Failed to load saved addresses from localStorage", err);
    return [];
  }
}

/**
 * Persists addresses to localStorage.
 */
export function saveAddresses(addresses: Address[]): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    window.localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(addresses));
  } catch (err) {
    console.warn("Failed to save addresses to localStorage", err);
  }
}

/**
 * Loads the active selected address ID from localStorage.
 */
export function getSelectedAddressId(): string | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  try {
    return window.localStorage.getItem(SELECTED_ADDRESS_KEY);
  } catch {
    return null;
  }
}

/**
 * Saves the active selected address ID to localStorage.
 */
export function saveSelectedAddressId(id: string | null): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    if (id) {
      window.localStorage.setItem(SELECTED_ADDRESS_KEY, id);
    } else {
      window.localStorage.removeItem(SELECTED_ADDRESS_KEY);
    }
  } catch (err) {
    console.warn("Failed to save selected address ID to localStorage", err);
  }
}

/**
 * Converts a saved Address into a unified DeliveryLocation.
 */
export function addressToDeliveryLocation(address: Address): DeliveryLocation {
  return {
    id: address.id,
    label: address.label,
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    displayName: `${address.street}, ${address.city}`,
    address,
  };
}

/**
 * Validation helper for address form fields.
 * Returns an object with field names and error messages.
 */
export function validateAddress(data: Partial<Address>): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.fullName || !data.fullName.trim()) {
    errors.fullName = "Full name is required";
  }

  const phoneDigits = (data.phone || "").replace(/\D/g, "");
  if (!phoneDigits) {
    errors.phone = "Phone number is required";
  } else if (!/^[6-9]\d{9}$/.test(phoneDigits)) {
    errors.phone = "Enter a valid 10-digit mobile number (starts with 6-9)";
  }

  if (!data.house || !data.house.trim()) {
    errors.house = "House / Flat / Building is required";
  }

  if (!data.street || !data.street.trim()) {
    errors.street = "Locality / Street is required";
  }

  if (!data.city || !data.city.trim()) {
    errors.city = "City is required";
  }

  if (!data.state || !data.state.trim()) {
    errors.state = "State is required";
  }

  const pincodeDigits = (data.pincode || "").replace(/\D/g, "");
  if (!pincodeDigits) {
    errors.pincode = "Pincode is required";
  } else if (!/^\d{6}$/.test(pincodeDigits)) {
    errors.pincode = "Enter a valid 6-digit pincode";
  }

  if (!data.label || !["Home", "Work", "Other"].includes(data.label)) {
    errors.label = "Please select an address label";
  }

  return errors;
}
