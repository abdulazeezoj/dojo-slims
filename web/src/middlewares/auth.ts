import { createErrorResponse } from "@/lib/api-response";
import { getSessionCookie } from "better-auth/cookies";
import { minimatch } from "minimatch";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Routes that are always public (no auth required)
 */
const AUTH_EXEMPT_ROUTES = [
  "/api/auth/*",
  "/api/health",
  "/api/health/*",
  "/",
  "/api/**/test/*",
];

/**
 * Routes that require authentication (return 401 if not authenticated)
 */
const AUTH_PROTECTED_ROUTES = [
  "/api/students/*",
  "/api/supervisors/*",
  "/api/sessions/*",
  "/api/logbook/*",
  "/api/admin/*",
  "/dashboard/*",
];

/**
 * Check if a pathname matches exempt routes using glob patterns
 */
function isExemptRoute(pathname: string): boolean {
  return AUTH_EXEMPT_ROUTES.some((pattern) => minimatch(pathname, pattern));
}

/**
 * Check if a pathname requires authentication using glob patterns
 */
function isProtectedRoute(pathname: string): boolean {
  return AUTH_PROTECTED_ROUTES.some((pattern) => minimatch(pathname, pattern));
}

/**
 * Core authentication middleware for proxy layer
 *
 * SECURITY NOTE: This uses getSessionCookie for fast optimistic checks
 * in the proxy/middleware layer. This ONLY checks if a session cookie EXISTS,
 * it does NOT validate the session. Per Better Auth recommendations:
 * - Use this for quick redirects in proxy/middleware
 * - ALWAYS validate sessions in each page/route using auth.api.getSession()
 * - API routes should use auth guards from auth-guards.ts
 *
 * See: https://www.better-auth.com/docs/integrations/next#cookie-based-checks-recommended-for-all-versions
 */
export async function authMiddleware(
  request: NextRequest,
  response?: NextResponse,
): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  if (isExemptRoute(pathname)) {
    return response || NextResponse.next();
  }

  const isProtected = isProtectedRoute(pathname);

  // Simple cookie check - just verify a session cookie exists
  const sessionCookie = getSessionCookie(request);

  if (isProtected && !sessionCookie) {
    return createErrorResponse("Invalid or expired session", {
      status: 401,
      code: "SESSION_INVALID",
    });
  }

  // Let the request through - actual validation happens in layouts/routes
  return response || NextResponse.next();
}
