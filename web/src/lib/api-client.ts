import axios, { type AxiosError, type AxiosInstance } from "axios";

import { clientConfig } from "./config-client";

/**
 * Get CSRF token from cookies
 */
function getCsrfTokenFromCookie(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const name = `${clientConfig.CSRF_COOKIE_NAME}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(";");

  for (let cookie of cookieArray) {
    cookie = cookie.trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length);
    }
  }

  return null;
}

/**
 * Create axios instance with CSRF protection and standard configuration
 *
 * This is a simple HTTP client with CSRF token injection.
 * It does NOT enforce any response structure - different APIs may return different formats.
 * Error handling and response parsing should be done by the consuming code.
 */
function createApiClient(): AxiosInstance {
  const instance = axios.create({
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });

  // Inject CSRF token for state-changing requests
  instance.interceptors.request.use(
    (config) => {
      const method = config.method?.toUpperCase();
      if (["POST", "PUT", "DELETE", "PATCH"].includes(method || "")) {
        const csrfToken = getCsrfTokenFromCookie();
        if (csrfToken) {
          config.headers["X-CSRF-Token"] = csrfToken;
        }
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  return instance;
}

/**
 * Singleton API client instance
 *
 * Use this for all client-side HTTP requests.
 * CSRF tokens are automatically included for POST/PUT/DELETE/PATCH requests.
 */
export const apiClient = createApiClient();

/**
 * Type guard to check if an error is an Axios error with response
 * Use this in TanStack Query/Mutation error handlers for proper type narrowing
 *
 * @example
 * if (isApiError(error)) {
 *   console.log(error.response.data);
 *   console.log(error.response.status);
 * }
 */
export function isApiError(error: unknown): error is AxiosError {
  return axios.isAxiosError(error);
}
