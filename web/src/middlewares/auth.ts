import { createErrorResponse } from "@/lib/api-response";
import { sessionStore } from "@/lib/auth";
import { getLogger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { minimatch } from "minimatch";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const logger = getLogger(["middlewares", "auth"]);

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

export type UserType =
  | "ADMIN"
  | "STUDENT"
  | "SCHOOL_SUPERVISOR"
  | "INDUSTRY_SUPERVISOR";

export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  userType: UserType;
  userReferenceId: string;
  isActive: boolean;
}

export interface AuthSession {
  token: string;
  userId: string;
  expiresAt: Date;
  user: AuthUser;
}

/**
 * Extract session token from cookies or Authorization header
 */
function extractSessionToken(request: NextRequest): string | null {
  // Try cookie first (default Better Auth approach)
  const cookieToken = request.cookies.get("better-auth.session_token")?.value;
  if (cookieToken) return cookieToken;

  // Fallback to Authorization header
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  return null;
}

/**
 * Get session from cache or database
 */
async function getSession(token: string): Promise<AuthSession | null> {
  try {
    let cachedSession = await sessionStore.get(token);

    if (cachedSession) {
      if (new Date(cachedSession.expiresAt) > new Date()) {
        return cachedSession as AuthSession;
      }
      await sessionStore.delete(token);
    }

    const dbSession = await prisma.session.findUnique({
      where: { token },
      include: {
        user: true,
      },
    });

    if (!dbSession) {
      return null;
    }

    if (dbSession.expiresAt < new Date()) {
      return null;
    }

    // Cast user to AuthUser (Prisma doesn't know about our enum)
    const session: AuthSession = {
      token: dbSession.token,
      userId: dbSession.userId,
      expiresAt: dbSession.expiresAt,
      user: {
        id: dbSession.user.id,
        email: dbSession.user.email,
        name: dbSession.user.name,
        userType: dbSession.user.userType as UserType,
        userReferenceId: dbSession.user.userReferenceId,
        isActive: dbSession.user.isActive,
      },
    };

    const ttl = Math.floor((dbSession.expiresAt.getTime() - Date.now()) / 1000);
    if (ttl > 0) {
      await sessionStore.set(token, session, ttl);
    }

    return session;
  } catch (error) {
    logger.error("Failed to get session", { error, token: token.slice(0, 10) });
    return null;
  }
}

/**
 * Core authentication middleware with session validation
 */
export async function authMiddleware(
  request: NextRequest,
  response?: NextResponse,
): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  if (isExemptRoute(pathname)) {
    return response || NextResponse.next();
  }

  const token = extractSessionToken(request);
  const isProtected = isProtectedRoute(pathname);

  if (isProtected && !token) {
    return createErrorResponse("Authentication required", {
      status: 401,
      code: "UNAUTHORIZED",
    });
  }

  if (!token) {
    return response || NextResponse.next();
  }

  const session = await getSession(token);

  if (isProtected && !session) {
    return createErrorResponse("Invalid or expired session", {
      status: 401,
      code: "SESSION_INVALID",
    });
  }

  if (!session) {
    return response || NextResponse.next();
  }

  if (!session.user.isActive) {
    logger.warn("Inactive user attempted access", {
      userId: session.user.id,
      userType: session.user.userType,
      pathname,
    });

    if (isProtected) {
      return createErrorResponse("Account is inactive", {
        status: 403,
        code: "ACCOUNT_INACTIVE",
      });
    }

    return response || NextResponse.next();
  }

  const res = response || NextResponse.next();
  res.headers.set("X-User-Id", session.user.id);
  res.headers.set("X-User-Type", session.user.userType);
  res.headers.set("X-User-Reference-Id", session.user.userReferenceId);
  res.headers.set("X-User-Email", session.user.email || "");
  res.headers.set("X-User-Name", session.user.name || "");

  return res;
}

/**
 * Require authentication - returns 401 if not authenticated
 */
export function requireAuth(
  handler: (
    request: NextRequest,
    session: AuthSession,
  ) => Promise<NextResponse>,
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const token = extractSessionToken(request);

    if (!token) {
      return createErrorResponse("Authentication required", {
        status: 401,
        code: "UNAUTHORIZED",
      });
    }

    const session = await getSession(token);

    if (!session) {
      return createErrorResponse("Invalid or expired session", {
        status: 401,
        code: "SESSION_INVALID",
      });
    }

    if (!session.user.isActive) {
      logger.warn("Inactive user attempted access", {
        userId: session.user.id,
        userType: session.user.userType,
      });
      return createErrorResponse("Account is inactive", {
        status: 403,
        code: "ACCOUNT_INACTIVE",
      });
    }

    return handler(request, session);
  };
}

/**
 * Require specific user type(s) - returns 403 if user type doesn't match
 */
export function requireUserType(...allowedTypes: UserType[]) {
  return (
    handler: (
      request: NextRequest,
      session: AuthSession,
    ) => Promise<NextResponse>,
  ) => {
    return requireAuth(async (request: NextRequest, session: AuthSession) => {
      if (!allowedTypes.includes(session.user.userType)) {
        logger.warn("User type not allowed", {
          userId: session.user.id,
          userType: session.user.userType,
          allowedTypes,
        });
        return createErrorResponse("Insufficient permissions", {
          status: 403,
          code: "INSUFFICIENT_PERMISSIONS",
        });
      }

      return handler(request, session);
    });
  };
}

/**
 * Convenience guards for specific user types
 */
export const requireAdmin = requireUserType("ADMIN");
export const requireStudent = requireUserType("STUDENT");
export const requireSchoolSupervisor = requireUserType("SCHOOL_SUPERVISOR");
export const requireIndustrySupervisor = requireUserType("INDUSTRY_SUPERVISOR");
export const requireAnySuper = requireUserType(
  "SCHOOL_SUPERVISOR",
  "INDUSTRY_SUPERVISOR",
);
export const requireStudentOrSupervisor = requireUserType(
  "STUDENT",
  "SCHOOL_SUPERVISOR",
  "INDUSTRY_SUPERVISOR",
);
