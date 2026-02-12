import { NextResponse } from "next/server";

import { isAppError } from "./errors";
import { getLogger } from "./logger";

import type { z } from "zod";


const logger = getLogger(["api"]);

/**
 * Standard API response structure
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
 * Create a successful API response
 */
export function createSuccessResponse<T>(
  data: T,
  options?: {
    status?: number;
    meta?: Record<string, unknown>;
  },
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...options?.meta,
    },
  };

  return NextResponse.json(response, { status: options?.status ?? 200 });
}

/**
 * Create an error API response
 */
export function createErrorResponse(
  message: string,
  options?: {
    status?: number;
    code?: string;
    details?: unknown;
  },
): NextResponse<ApiResponse> {
  const response: ApiResponse = {
    success: false,
    error: {
      message,
      code: options?.code,
      details: options?.details,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  return NextResponse.json(response, { status: options?.status ?? 500 });
}

/**
 * Create a validation error response from Zod errors
 */
export function createValidationErrorResponse(
  errors: z.ZodIssue[],
): NextResponse<ApiResponse> {
  const formattedErrors = errors.map((err) => ({
    path: err.path.join("."),
    message: err.message,
    code: err.code,
  }));

  return createErrorResponse("Validation failed", {
    status: 400,
    code: "VALIDATION_ERROR",
    details: formattedErrors,
  });
}

/**
 * Parse and validate request body
 */
export async function parseRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>,
): Promise<
  | { success: true; data: T }
  | { success: false; response: NextResponse<ApiResponse> }
> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return {
        success: false,
        response: createValidationErrorResponse(result.error.issues),
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch {
    return {
      success: false,
      response: createErrorResponse("Invalid JSON in request body", {
        status: 400,
        code: "INVALID_JSON",
      }),
    };
  }
}

/**
 * Parse and validate query parameters
 */
export function parseQueryParams<T>(
  request: Request,
  schema: z.ZodSchema<T>,
):
  | { success: true; data: T }
  | { success: false; response: NextResponse<ApiResponse> } {
  try {
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const result = schema.safeParse(params);

    if (!result.success) {
      return {
        success: false,
        response: createValidationErrorResponse(result.error.issues),
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch {
    return {
      success: false,
      response: createErrorResponse("Invalid query parameters", {
        status: 400,
        code: "INVALID_QUERY",
      }),
    };
  }
}

/**
 * Wrap async route handler with error handling
 */
export async function withErrorHandler<T>(
  handler: (request?: Request) => Promise<NextResponse<ApiResponse<T>>>,
  request?: Request,
): Promise<NextResponse<ApiResponse<T>>> {
  try {
    return await handler(request);
  } catch (error) {
    // Handle custom application errors with appropriate status codes
    if (isAppError(error)) {
      logger.warn("Business logic error", {
        message: error.message,
        statusCode: error.statusCode,
        code: error.code,
      });
      
      return createErrorResponse(error.message, {
        status: error.statusCode,
        code: error.code,
      }) as NextResponse<ApiResponse<T>>;
    }

    // Handle unexpected errors
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    logger.error("Unhandled route error", {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });

    return createErrorResponse(errorMessage, {
      status: 500,
      code: "INTERNAL_ERROR",
    }) as NextResponse<ApiResponse<T>>;
  }
}
