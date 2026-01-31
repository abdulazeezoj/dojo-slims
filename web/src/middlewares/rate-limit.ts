import { createErrorResponse } from "@/lib/api-response";
import { config } from "@/lib/config";
import { getLogger } from "@/lib/logger";
import { redis } from "@/lib/redis";
import { minimatch } from "minimatch";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const logger = getLogger(["middlewares", "rate-limit"]);

/**
 * Rate limit configuration for specific paths
 * Uses minimatch patterns for flexible path matching
 */
const PATH_RATE_LIMITS: Array<{
  pattern: string;
  limit: number;
  windowMs: number;
  description?: string;
}> = [
  // Authentication endpoints - strict limits
  {
    pattern: "/api/auth/sign-in",
    limit: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    description: "Sign in attempts",
  },
  {
    pattern: "/api/auth/sign-up",
    limit: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    description: "Sign up attempts",
  },
  {
    pattern: "/api/auth/forgot-password",
    limit: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    description: "Password reset requests",
  },
  {
    pattern: "/api/auth/reset-password",
    limit: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    description: "Password reset attempts",
  },
  {
    pattern: "/api/auth/magic-link",
    limit: 3,
    windowMs: 15 * 60 * 1000, // 15 minutes
    description: "Magic link requests",
  },
  {
    pattern: "/api/auth/**",
    limit: 20,
    windowMs: 15 * 60 * 1000, // 15 minutes
    description: "General auth endpoints",
  },

  // File upload endpoints - moderate limits
  {
    pattern: "/api/**/upload",
    limit: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
    description: "File uploads",
  },
  {
    pattern: "/api/**/upload/**",
    limit: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
    description: "File upload operations",
  },

  // Bulk operations - lower limits
  {
    pattern: "/api/**/bulk/**",
    limit: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
    description: "Bulk operations",
  },
  {
    pattern: "/api/**/import",
    limit: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
    description: "Import operations",
  },
  {
    pattern: "/api/**/export",
    limit: 10,
    windowMs: 15 * 60 * 1000, // 15 minutes
    description: "Export operations",
  },

  // PDF generation - moderate limits
  {
    pattern: "/api/**/pdf/**",
    limit: 20,
    windowMs: 60 * 60 * 1000, // 1 hour
    description: "PDF generation",
  },

  // Search endpoints - higher limits
  {
    pattern: "/api/**/search",
    limit: 50,
    windowMs: 60 * 1000, // 1 minute
    description: "Search operations",
  },

  // Email sending - strict limits
  {
    pattern: "/api/**/send-email",
    limit: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
    description: "Email sending",
  },

  // General API endpoints - use default from config
];

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

/**
 * Rate limiting middleware using Redis for distributed rate limiting
 */
export async function rateLimitMiddleware(
  request: NextRequest,
  response?: NextResponse,
): Promise<NextResponse> {
  const res = response || NextResponse.next();

  // Skip if rate limiting is disabled
  if (!config.RATE_LIMIT_ENABLED) {
    return res;
  }

  try {
    const identifier = getIdentifier(request);
    const pathname = request.nextUrl.pathname;

    const rateLimit = await checkRateLimit(identifier, pathname);

    if (!rateLimit.allowed) {
      logger.warn("Rate limit exceeded", {
        identifier,
        pathname,
        limit: rateLimit.limit,
        remaining: rateLimit.remaining,
        resetAt: rateLimit.resetAt,
      });

      const errorResponse = createErrorResponse(
        "Too many requests. Please try again later.",
        {
          status: 429,
          code: "RATE_LIMIT_EXCEEDED",
          details: {
            retryAfter: rateLimit.retryAfter,
            limit: rateLimit.limit,
            remaining: rateLimit.remaining,
            resetAt: rateLimit.resetAt,
          },
        },
      );

      // Add rate limit headers
      errorResponse.headers.set(
        "X-RateLimit-Limit",
        rateLimit.limit.toString(),
      );
      errorResponse.headers.set(
        "X-RateLimit-Remaining",
        rateLimit.remaining.toString(),
      );
      errorResponse.headers.set(
        "X-RateLimit-Reset",
        rateLimit.resetAt.toString(),
      );
      errorResponse.headers.set(
        "Retry-After",
        rateLimit.retryAfter?.toString() || "60",
      );

      return errorResponse;
    }

    // Add rate limit headers to response
    res.headers.set("X-RateLimit-Limit", rateLimit.limit.toString());
    res.headers.set("X-RateLimit-Remaining", rateLimit.remaining.toString());
    res.headers.set("X-RateLimit-Reset", rateLimit.resetAt.toString());

    return res;
  } catch (error) {
    logger.error("Rate limit check failed", {
      error,
      pathname: request.nextUrl.pathname,
    });

    return res;
  }
}

/**
 * Get unique identifier for rate limiting
 * Prefers user ID if available, falls back to IP address
 */
function getIdentifier(request: NextRequest): string {
  const userId = request.headers.get("X-User-Id");
  if (userId) return `user:${userId}`;

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  return `ip:${ip}`;
}

/**
 * Get rate limit configuration for a given pathname
 * Uses minimatch to find the first matching pattern
 */
function getRateLimitConfig(pathname: string): {
  limit: number;
  windowMs: number;
} {
  for (const pathConfig of PATH_RATE_LIMITS) {
    if (minimatch(pathname, pathConfig.pattern)) {
      return {
        limit: pathConfig.limit,
        windowMs: pathConfig.windowMs,
      };
    }
  }

  return {
    limit: config.RATE_LIMIT_MAX_REQUESTS,
    windowMs: config.RATE_LIMIT_WINDOW_MS,
  };
}

/**
 * Check rate limit using Redis sliding window algorithm
 */
async function checkRateLimit(
  identifier: string,
  pathname: string,
): Promise<RateLimitResult> {
  const rateLimitConfig = getRateLimitConfig(pathname);
  const key = `ratelimit:${identifier}:${pathname}`;
  const now = Date.now();
  const windowStart = now - rateLimitConfig.windowMs;

  try {
    const pipeline = redis.pipeline();

    pipeline.zremrangebyscore(key, 0, windowStart);
    pipeline.zcard(key);
    pipeline.zadd(key, now, `${now}-${Math.random()}`);
    pipeline.expire(key, Math.ceil(rateLimitConfig.windowMs / 1000) + 10);

    const results = await pipeline.exec();

    if (!results) {
      throw new Error("Redis pipeline execution failed");
    }

    const count = (results[1]?.[1] as number) || 0;
    const allowed = count < rateLimitConfig.limit;
    const remaining = Math.max(0, rateLimitConfig.limit - count - 1);

    const resetAt = now + rateLimitConfig.windowMs;
    const retryAfter = allowed
      ? undefined
      : Math.ceil(rateLimitConfig.windowMs / 1000);

    return {
      allowed,
      limit: rateLimitConfig.limit,
      remaining,
      resetAt,
      retryAfter,
    };
  } catch (error) {
    logger.error("Redis rate limit check failed", { error, key });
    return {
      allowed: true,
      limit: rateLimitConfig.limit,
      remaining: rateLimitConfig.limit,
      resetAt: now + rateLimitConfig.windowMs,
    };
  }
}
