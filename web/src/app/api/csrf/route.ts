import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { config } from "@/lib/config";
import { getCsrfToken } from "@/middlewares/csrf";
import { NextRequest } from "next/server";

/**
 * Get CSRF token endpoint with origin validation
 */
export async function GET(request: NextRequest) {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const expectedOrigin = config.APP_URL;

  const isSameOrigin =
    (origin && origin === expectedOrigin) ||
    (referer && referer.startsWith(expectedOrigin));

  if (!isSameOrigin && config.NODE_ENV === "production") {
    return createErrorResponse("Invalid origin", {
      status: 403,
      code: "INVALID_ORIGIN",
    });
  }

  const token = getCsrfToken(request);

  if (!token) {
    return createErrorResponse(
      "CSRF token not available. Please refresh the page.",
      {
        status: 500,
        code: "CSRF_TOKEN_NOT_GENERATED",
      },
    );
  }

  return createSuccessResponse({
    message: "CSRF token is available in cookie",
  });
}
