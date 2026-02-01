import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * Validate request body and/or query parameters using Zod schemas
 * Throws on validation error (returns NextResponse with 400 status)
 *
 * @example
 * const result = await validateRequest(request, {
 *   body: createStudentSchema,
 *   query: paginationSchema
 * });
 *
 * if (!result.success) {
 *   return result.error;
 * }
 *
 * const { body, query } = result.data;
 */
export async function validateRequest<TBody = unknown, TQuery = unknown>(
  request: NextRequest,
  schemas: {
    body?: z.ZodSchema<TBody>;
    query?: z.ZodSchema<TQuery>;
  },
) {
  try {
    const validated: {
      body?: TBody;
      query?: TQuery;
    } = {};

    if (schemas.body) {
      try {
        const bodyData = await request.json();
        validated.body = schemas.body.parse(bodyData);
      } catch (jsonError) {
        return {
          success: false as const,
          error: NextResponse.json(
            {
              error: "Invalid JSON in request body",
              details:
                jsonError instanceof Error
                  ? jsonError.message
                  : "Unknown error",
            },
            { status: 400 },
          ),
        };
      }
    }

    if (schemas.query) {
      const searchParams = request.nextUrl.searchParams;
      const queryData = Object.fromEntries(searchParams.entries());
      validated.query = schemas.query.parse(queryData);
    }

    return {
      success: true as const,
      data: validated,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false as const,
        error: NextResponse.json(
          {
            error: "Validation failed",
            errors: error.issues.map((err) => ({
              path: err.path.join("."),
              message: err.message,
            })),
          },
          { status: 400 },
        ),
      };
    }

    return {
      success: false as const,
      error: NextResponse.json(
        { error: "Request validation failed" },
        { status: 400 },
      ),
    };
  }
}

/**
 * Safe validation that returns errors instead of throwing
 * Use when you want to handle validation errors manually
 *
 * @example
 * const result = await validateRequestSafe(request, {
 *   body: createStudentSchema,
 * });
 *
 * if (!result.success) {
 *   // Handle errors manually
 *   return createErrorResponse('Validation failed', {
 *     status: 400,
 *     errors: result.errors
 *   });
 * }
 *
 * const { body } = result.data;
 */
export async function validateRequestSafe<TBody = unknown, TQuery = unknown>(
  request: NextRequest,
  schemas: {
    body?: z.ZodSchema<TBody>;
    query?: z.ZodSchema<TQuery>;
  },
) {
  const validated: {
    body?: TBody;
    query?: TQuery;
  } = {};

  const errors: z.ZodError[] = [];

  // Validate body
  if (schemas.body) {
    try {
      const bodyData = await request.json();
      const result = schemas.body.safeParse(bodyData);

      if (result.success) {
        validated.body = result.data;
      } else {
        errors.push(result.error);
      }
    } catch (jsonError) {
      return {
        success: false as const,
        errors: [{ message: "Invalid JSON in request body" }],
      };
    }
  }

  // Validate query
  if (schemas.query) {
    const searchParams = request.nextUrl.searchParams;
    const queryData = Object.fromEntries(searchParams.entries());
    const result = schemas.query.safeParse(queryData);

    if (result.success) {
      validated.query = result.data;
    } else {
      errors.push(result.error);
    }
  }

  if (errors.length > 0) {
    return {
      success: false as const,
      errors: errors.flatMap((e) => e.issues),
    };
  }

  return {
    success: true as const,
    data: validated,
  };
}
