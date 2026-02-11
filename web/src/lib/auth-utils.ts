import bcrypt from "bcryptjs";

import { isApiError } from "./api-client";
import { isBetterAuthError } from "./auth-client";

/**
 * Hash a password using bcrypt
 * @param password - Plain text password to hash
 * @param saltRounds - Number of salt rounds (default: 10)
 * @returns Hashed password
 */
export async function hashPassword(
  password: string,
  saltRounds: number = 10,
): Promise<string> {
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against a hash
 * @param password - Plain text password to verify
 * @param hash - Hashed password to compare against
 * @returns True if password matches hash, false otherwise
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Extracts error message from various error formats
 * Returns better-auth error messages as-is for now.
 *
 * Better-auth returns format: { code: "ERROR_CODE", message: "Error message" }
 *
 * TODO: Add user-friendly message mapping later if needed
 */
export function mapAuthError(error: unknown): string {
  // Axios error with response
  if (isApiError(error)) {
    const data = error.response?.data;

    // Better-auth format: { code, message }
    if (isBetterAuthError(data)) {
      return data.message;
    }

    // Plain string response
    if (typeof data === "string") {
      return data;
    }

    // Nested error object (other APIs)
    if (data && typeof data === "object" && "error" in data) {
      const errorData = data.error;
      if (typeof errorData === "string") {
        return errorData;
      }
      if (
        errorData &&
        typeof errorData === "object" &&
        "message" in errorData &&
        typeof errorData.message === "string"
      ) {
        return errorData.message;
      }
    }

    // Fallback to HTTP status text
    if (error.response?.statusText) {
      return error.response.statusText;
    }
  }

  // Standard Error object
  if (error instanceof Error) {
    return error.message;
  }

  // Network or unknown errors
  return "An unexpected error occurred. Please try again.";
}
