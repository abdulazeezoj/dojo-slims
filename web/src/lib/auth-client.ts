import { createAuthClient } from "better-auth/client";
import {
  adminClient,
  magicLinkClient,
  usernameClient,
} from "better-auth/client/plugins";

import { clientConfig } from "./config-client";

export const authClient = createAuthClient({
  baseURL: clientConfig.APP_URL,
  plugins: [magicLinkClient(), usernameClient(), adminClient()],
});

/**
 * Better-auth API response types
 *
 * Better-auth does NOT wrap responses in a standard ApiResponse format.
 * - Success: Returns the data directly (user, session, token, etc.)
 * - Error: Returns { code: string, message: string } with appropriate HTTP status
 */

/**
 * Better-auth error response format
 * Returned with 4xx/5xx HTTP status codes
 */
export interface BetterAuthError {
  code: string;
  message: string;
}

/**
 * Common better-auth session response
 */
export interface BetterAuthSession {
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    name: string | null;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;
  } & Record<string, unknown>; // Allow additional fields
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
}

/**
 * Sign-in response (email/username/password)
 */
export type SignInResponse = BetterAuthSession;

/**
 * Magic link request response
 */
export interface MagicLinkResponse {
  success: boolean;
  message: string;
}

/**
 * Type guard to check if response is a better-auth error
 */
export function isBetterAuthError(data: unknown): data is BetterAuthError {
  return (
    typeof data === "object" &&
    data !== null &&
    "code" in data &&
    "message" in data &&
    typeof (data as Record<string, unknown>).code === "string" &&
    typeof (data as Record<string, unknown>).message === "string"
  );
}
