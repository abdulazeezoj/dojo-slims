import { config } from "@/lib/config";
import { getLogger } from "@/lib/logger";
import { minimatch } from "minimatch";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const logger = getLogger(["middlewares", "security"]);

function getAllowedOrigins(): string[] {
  const origins = [...config.CORS_ALLOWED_ORIGINS];

  if (!origins.includes(config.APP_URL)) {
    origins.push(config.APP_URL);
  }

  return origins;
}

function isOriginAllowed(origin: string, allowedOrigins: string[]): boolean {
  return allowedOrigins.some((pattern) => minimatch(origin, pattern));
}

/**
 * Security middleware for setting security headers and CORS
 */
export function securityMiddleware(
  request: NextRequest,
  response?: NextResponse,
): NextResponse {
  const res = response || NextResponse.next();

  // CORS Configuration
  const allowedOrigins = getAllowedOrigins();
  const requestOrigin = request.headers.get("origin");

  if (requestOrigin && isOriginAllowed(requestOrigin, allowedOrigins)) {
    res.headers.set("Access-Control-Allow-Origin", requestOrigin);
    res.headers.set("Access-Control-Allow-Credentials", "true");
  } else if (requestOrigin && config.NODE_ENV === "production") {
    logger.warn("Blocked CORS request from unauthorized origin", {
      origin: requestOrigin,
      pathname: request.nextUrl.pathname,
    });
  }

  if (request.method === "OPTIONS") {
    res.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    );
    res.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-CSRF-Token, X-Requested-With",
    );
    res.headers.set("Access-Control-Max-Age", "86400");

    return new NextResponse(null, { status: 204, headers: res.headers });
  }

  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  );

  if (config.SECURITY_ENABLE_CSP) {
    const cspDirectives = [
      "default-src 'self'",
      config.NODE_ENV === "development"
        ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
        : "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ];

    if (config.SECURITY_CSP_REPORT_URI) {
      cspDirectives.push(`report-uri ${config.SECURITY_CSP_REPORT_URI}`);
    }

    res.headers.set("Content-Security-Policy", cspDirectives.join("; "));
  }

  if (config.SECURITY_ENABLE_HSTS && config.NODE_ENV === "production") {
    res.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );
  }

  return res;
}
