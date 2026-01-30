import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
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
 * Custom API Response Interface
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Create axios instance with CSRF protection and standard configuration
 */
function createApiClient(): AxiosInstance {
  const instance = axios.create({
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });

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

  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiResponse>) => {
      if (error.response) {
        const { data, status } = error.response;

        const errorMessage = data?.error?.message || "An error occurred";
        const errorCode = data?.error?.code;
        const errorDetails = data?.error?.details;

        throw new ApiError(errorMessage, status, errorCode, errorDetails);
      } else if (error.request) {
        throw new ApiError("No response from server", 0, "NETWORK_ERROR");
      } else {
        throw new ApiError(error.message, 0, "REQUEST_SETUP_ERROR");
      }
    },
  );

  return instance;
}

/**
 * Singleton API client instance
 */
export const apiClient = createApiClient();

/**
 * Type-safe wrapper for API calls
 */
export async function apiRequest<T>(
  config: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  const response = await apiClient.request<ApiResponse<T>>(config);
  return response.data;
}

export const api = {
  get: async <T>(url: string, config?: AxiosRequestConfig) => {
    return apiRequest<T>({ ...config, method: "GET", url });
  },

  post: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => {
    return apiRequest<T>({ ...config, method: "POST", url, data });
  },

  put: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => {
    return apiRequest<T>({ ...config, method: "PUT", url, data });
  },

  patch: async <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ) => {
    return apiRequest<T>({ ...config, method: "PATCH", url, data });
  },

  delete: async <T>(url: string, config?: AxiosRequestConfig) => {
    return apiRequest<T>({ ...config, method: "DELETE", url });
  },
};

/**
 * Utility to check if error is ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Format error for display
 */
export function formatApiError(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unknown error occurred";
}
