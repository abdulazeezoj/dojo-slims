import {
  authMiddleware,
  csrfMiddleware,
  rateLimitMiddleware,
  securityMiddleware,
} from "./middlewares";

import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  // 1. Security headers and CORS
  const securityResponse = securityMiddleware(request);
  if (securityResponse.status !== 200 && securityResponse.status !== 304) {
    return securityResponse;
  }

  // 2. Rate limiting (placeholder)
  const rateLimitResponse = await rateLimitMiddleware(
    request,
    securityResponse,
  );
  if (rateLimitResponse.status !== 200 && rateLimitResponse.status !== 304) {
    return rateLimitResponse;
  }

  // 3. CSRF protection
  const csrfResponse = csrfMiddleware(request, rateLimitResponse);
  if (csrfResponse.status !== 200 && csrfResponse.status !== 304) {
    return csrfResponse;
  }
  // return csrfResponse;

  // 4. Authentication and authorization
  const authResponse = await authMiddleware(request, csrfResponse);

  return authResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
