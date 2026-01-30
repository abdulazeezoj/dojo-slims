import { createErrorResponse } from "@/lib/api-response";
import { config } from "@/lib/config";
import { getLogger } from "@/lib/logger";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { minimatch } from "minimatch";
import { NextRequest, NextResponse } from "next/server";

const logger = getLogger(["middlewares", "csrf"]);

/**
 * CSRF Token Data Structure
 */
interface CsrfTokenData {
  token: string;
  signature: string;
  expiresAt: number;
}

// Configuration constants
const CSRF_COOKIE_NAME = config.CSRF_COOKIE_NAME;
const CSRF_CLIENT_COOKIE_NAME = config.CSRF_CLIENT_COOKIE_NAME;
const CSRF_SECRET = config.CSRF_SECRET;
const TOKEN_EXPIRY_MS = config.CSRF_TOKEN_EXPIRY_M * 60 * 1000; // Convert minutes to milliseconds
const CSRF_EXEMPT_ROUTES = [
  "/api/auth/*",
  "/api/**/callback",
  "/api/webhooks/*",
  "/api/health",
  "/api/health/*",
  "/api/csrf",
];

/**
 * Check if a pathname matches exempt routes using glob patterns
 */
function isExemptRoute(pathname: string): boolean {
  return CSRF_EXEMPT_ROUTES.some((pattern) => minimatch(pathname, pattern));
}

/**
 * Sign a token using HMAC
 */
function signToken(token: string): string {
  return createHmac("sha256", CSRF_SECRET).update(token).digest("hex");
}

/**
 * Verify token signature using constant-time comparison
 */
function verifyTokenSignature(token: string, signature: string): boolean {
  const expectedSignature = signToken(token);

  if (signature.length !== expectedSignature.length) {
    return false;
  }

  try {
    return timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex"),
    );
  } catch {
    return false;
  }
}

/**
 * Parse and validate CSRF cookie
 */
function parseCsrfCookie(cookieValue: string): CsrfTokenData | null {
  try {
    const data: CsrfTokenData = JSON.parse(cookieValue);

    // Validate structure
    if (!data.token || !data.signature || !data.expiresAt) {
      return null;
    }

    // Verify signature
    if (!verifyTokenSignature(data.token, data.signature)) {
      logger.warn("Invalid token signature detected");
      return null;
    }

    // Check expiry
    if (Date.now() > data.expiresAt) {
      return null;
    }

    return data;
  } catch (error) {
    logger.error("Failed to parse CSRF cookie", { error });
    return null;
  }
}

/**
 * Generate a new CSRF token with signature
 */
function generateCsrfToken(): CsrfTokenData {
  const token = randomBytes(32).toString("hex");
  const signature = signToken(token);
  const expiresAt = Date.now() + TOKEN_EXPIRY_MS;

  return {
    token,
    signature,
    expiresAt,
  };
}

/**
 * CSRF protection middleware for state-changing requests
 */
export function csrfMiddleware(
  request: NextRequest,
  response?: NextResponse,
): NextResponse {
  const { pathname } = request.nextUrl;
  const method = request.method;
  const res = response || NextResponse.next();

  // Check if route is exempt from CSRF validation
  if (isExemptRoute(pathname)) {
    return res;
  }

  // Only validate CSRF for state-changing methods
  if (["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
    // Get CSRF token from cookie (validation source)
    const csrfCookie = request.cookies.get(CSRF_COOKIE_NAME);

    if (!csrfCookie) {
      logger.error("Token missing", { method, pathname });
      return createErrorResponse(
        "CSRF token missing. Please refresh the page and try again.",
        {
          status: 403,
          code: "CSRF_TOKEN_MISSING",
        },
      );
    }

    const storedTokenData = parseCsrfCookie(csrfCookie.value);

    if (!storedTokenData) {
      logger.error("Invalid or expired token", { method, pathname });
      return createErrorResponse(
        "Invalid or expired CSRF token. Please refresh the page and try again.",
        {
          status: 403,
          code: "CSRF_TOKEN_INVALID",
        },
      );
    }

    // Get token from X-CSRF-Token header (client should send this)
    const headerToken = request.headers.get("X-CSRF-Token");

    if (!headerToken) {
      logger.error("Token not provided in header", { method, pathname });
      return createErrorResponse(
        "CSRF token not provided. Please include X-CSRF-Token header.",
        {
          status: 403,
          code: "CSRF_TOKEN_NOT_PROVIDED",
        },
      );
    }

    // Validate that header token matches stored token
    try {
      if (
        !timingSafeEqual(
          Buffer.from(storedTokenData.token, "hex"),
          Buffer.from(headerToken, "hex"),
        )
      ) {
        logger.error("Token mismatch", { method, pathname });
        return createErrorResponse(
          "CSRF token mismatch. Please refresh the page and try again.",
          {
            status: 403,
            code: "CSRF_TOKEN_MISMATCH",
          },
        );
      }
    } catch (error) {
      logger.error("Token comparison failed", { error, method, pathname });
      return createErrorResponse("Invalid CSRF token format.", {
        status: 403,
        code: "CSRF_TOKEN_INVALID_FORMAT",
      });
    }

    return res;
  }

  // Generate and set new CSRF token for GET requests if missing or invalid
  if (method === "GET") {
    const existingCookie = request.cookies.get(CSRF_COOKIE_NAME);
    const existingTokenData = existingCookie
      ? parseCsrfCookie(existingCookie.value)
      : null;

    // Only generate new token if none exists or current one is invalid/expired
    if (!existingTokenData) {
      const tokenData = generateCsrfToken();

      res.cookies.set(CSRF_COOKIE_NAME, JSON.stringify(tokenData), {
        httpOnly: true,
        secure: config.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: Math.floor(TOKEN_EXPIRY_MS / 1000),
      });

      res.cookies.set(CSRF_CLIENT_COOKIE_NAME, tokenData.token, {
        httpOnly: false,
        secure: config.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: Math.floor(TOKEN_EXPIRY_MS / 1000),
      });
    } else {
      const readableCookie = request.cookies.get(CSRF_CLIENT_COOKIE_NAME);
      if (!readableCookie || readableCookie.value !== existingTokenData.token) {
        res.cookies.set(CSRF_CLIENT_COOKIE_NAME, existingTokenData.token, {
          httpOnly: false,
          secure: config.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
          maxAge: Math.floor(TOKEN_EXPIRY_MS / 1000),
        });
      }
    }
  }

  return res;
}

/**
 * Get CSRF token from cookie for client-side use
 */
export function getCsrfToken(request: NextRequest): string | null {
  const csrfCookie = request.cookies.get(CSRF_COOKIE_NAME);

  if (!csrfCookie) {
    return null;
  }

  const tokenData = parseCsrfCookie(csrfCookie.value);
  return tokenData ? tokenData.token : null;
}

/**
 * Manually validate CSRF token in API routes
 */
export function validateCsrfToken(
  request: NextRequest,
  providedToken: string,
): boolean {
  const csrfCookie = request.cookies.get(CSRF_COOKIE_NAME);

  if (!csrfCookie) {
    return false;
  }

  const tokenData = parseCsrfCookie(csrfCookie.value);

  if (!tokenData) {
    return false;
  }

  try {
    return timingSafeEqual(
      Buffer.from(tokenData.token, "hex"),
      Buffer.from(providedToken, "hex"),
    );
  } catch {
    return false;
  }
}
