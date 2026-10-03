import type { UserProfile } from "../types";

export const PROFILE_STORAGE_KEY = "mithilakart_profile_v1";

/**
 * Extracts clean 1-2 letter initials from a person's name.
 * e.g. "Piyush Kumar" -> "PK", "Rahul" -> "R", "" -> ""
 */
export function getInitials(name?: string): string {
  if (!name || !name.trim()) return "";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Validates standard Indian 10-digit mobile phone numbers starting with 6, 7, 8, or 9.
 */
export function validateIndianPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-()]/g, "");
  return /^[6-9]\d{9}$/.test(cleaned);
}

/**
 * Validates standard email address format.
 */
export function validateEmail(email: string): boolean {
  const cleaned = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned);
}

/**
 * Loads the saved user profile from localStorage.
 * Safely handles corrupted JSON and null storage.
 */
export function getProfile(): UserProfile | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.fullName === "string" &&
      parsed.fullName.trim().length > 0
    ) {
      return parsed as UserProfile;
    }
    return null;
  } catch (err) {
    console.warn("MithilaKart: Failed to read user profile from localStorage", err);
    return null;
  }
}

/**
 * Saves a user profile to localStorage.
 */
export function saveProfile(profile: UserProfile): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.warn("MithilaKart: Failed to save user profile to localStorage", err);
  }
}

/**
 * Clears the user profile from localStorage (for test/dev).
 */
export function clearProfile(): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
  } catch (err) {
    console.warn("MithilaKart: Failed to clear user profile from localStorage", err);
  }
}
