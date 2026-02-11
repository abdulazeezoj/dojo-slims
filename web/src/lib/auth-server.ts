import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse, type NextRequest } from "next/server";
import { cache } from "react";

import { createErrorResponse } from "@/lib/api-response";
import { auth } from "@/lib/auth";
import type { AuthSession, UserType } from "@/lib/auth-types";
import { getLogger } from "@/lib/logger";

const logger = getLogger(["lib", "auth-server"]);

/**
 * Get session for server components with request-level caching
 * Uses React's cache() to memoize per request
 */
export const getServerSession = cache(async (): Promise<AuthSession | null> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (session) {
      logger.debug("getServerSession: Retrieved session - userId: {userId}", {
        userId: session.user.id,
      });
    } else {
      logger.debug("getServerSession: No active session found");
    }

    if (!session) {
      return null;
    }

    // Map Better Auth session to our AuthSession interface
    return {
      token: session.session.token,
      userId: session.user.id,
      expiresAt: new Date(session.session.expiresAt),
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        userType: session.user.userType as UserType,
        role: session.user.role || "user",
        isActive: !session.user.banned,
      },
    };
  } catch (error) {
    logger.error("Failed to get session: {error}", { error });
    return null;
  }
});

/**
 * Get dashboard URL for a given user type
 */
export async function getDashboardUrl(userType: UserType): Promise<string> {
  const dashboardMap: Record<UserType, string> = {
    ADMIN: "/admin",
    STUDENT: "/student/dashboard",
    SCHOOL_SUPERVISOR: "/school-supervisor/dashboard",
    INDUSTRY_SUPERVISOR: "/industry-supervisor/dashboard",
  };

  return dashboardMap[userType];
}

/**
 * Require authentication in server components
 * Redirects to /auth if not authenticated
 * @returns AuthSession if authenticated
 */
export async function requireServerAuth(): Promise<AuthSession> {
  const session = await getServerSession();

  if (!session) {
    logger.warn("Unauthenticated access attempt to protected server component");
    redirect("/auth");
  }

  if (!session.user.isActive) {
    logger.warn(
      "Inactive user attempted access - userId: {userId}, userType: {userType}",
      {
        userId: session.user.id,
        userType: session.user.userType,
      },
    );
    redirect("/auth");
  }

  return session;
}

/**
 * Require specific user type(s) in server components
 * Redirects to /auth if not authenticated
 * Redirects to /forbidden if wrong user type
 * @returns AuthSession if authorized
 */
export async function requireServerUserType(
  ...allowedTypes: UserType[]
): Promise<AuthSession> {
  const session = await requireServerAuth();

  if (!allowedTypes.includes(session.user.userType)) {
    logger.warn(
      "User type not allowed - userId: {userId}, userType: {userType}, allowedTypes: {allowedTypes}",
      {
        userId: session.user.id,
        userType: session.user.userType,
        allowedTypes,
      },
    );

    redirect(`/forbidden?userType=${session.user.userType}`);
  }

  return session;
}

/**
 * Convenience helpers for specific user types
 */

export async function requireServerAdmin(): Promise<AuthSession> {
  return requireServerUserType("ADMIN");
}

export async function requireServerStudent(): Promise<AuthSession> {
  return requireServerUserType("STUDENT");
}

export async function requireServerSchoolSupervisor(): Promise<AuthSession> {
  return requireServerUserType("SCHOOL_SUPERVISOR");
}

export async function requireServerIndustrySupervisor(): Promise<AuthSession> {
  return requireServerUserType("INDUSTRY_SUPERVISOR");
}

export async function requireServerAnySupervisor(): Promise<AuthSession> {
  return requireServerUserType("SCHOOL_SUPERVISOR", "INDUSTRY_SUPERVISOR");
}

export async function requireServerStudentOrSupervisor(): Promise<AuthSession> {
  return requireServerUserType(
    "STUDENT",
    "SCHOOL_SUPERVISOR",
    "INDUSTRY_SUPERVISOR",
  );
}

/**
 * ============================================================================
 * API Route Guards (for Next.js API routes)
 * ============================================================================
 * These use cookie cache for API route authorization
 * Use these to wrap API route handlers
 */

/**
 * Get session for API routes with full validation
 * Uses Better Auth's getSession with cookies for proper session validation
 */
async function getApiSession(
  request: NextRequest,
): Promise<AuthSession | null> {
  try {
    // Use Better Auth's getSession with cookies from request
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (session) {
      logger.debug(
        "getApiSession: Retrieved session - userId: {userId}, userType: {userType}",
        {
          userId: session.user.id,
          userType: session.user.userType,
        },
      );
    } else {
      logger.debug("getApiSession: No active session found for API request");
    }

    if (!session) {
      return null;
    }

    // Map Better Auth session to our AuthSession interface
    return {
      token: session.session.token,
      userId: session.user.id,
      expiresAt: new Date(session.session.expiresAt),
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        userType: session.user.userType as UserType,
        role: session.user.role || "user",
        isActive: !session.user.banned,
      },
    };
  } catch (error) {
    logger.error("Failed to get session: {error}", { error });
    return null;
  }
}

/**
 * Require authentication for API routes - returns 401 if not authenticated
 * Use this to wrap API route handlers that need authentication
 */
export function requireAuth<TContext = unknown>(
  handler: (
    request: NextRequest,
    session: AuthSession,
    context: TContext,
  ) => Promise<NextResponse>,
) {
  return async (
    request: NextRequest,
    context: TContext,
  ): Promise<NextResponse> => {
    const session = await getApiSession(request);

    if (!session) {
      return createErrorResponse("Invalid or expired session", {
        status: 401,
        code: "SESSION_INVALID",
      });
    }

    if (!session.user.isActive) {
      logger.warn(
        "Inactive user attempted access - userId: {userId}, userType: {userType}",
        {
          userId: session.user.id,
          userType: session.user.userType,
        },
      );
      return createErrorResponse("Account is inactive", {
        status: 403,
        code: "ACCOUNT_INACTIVE",
      });
    }

    return handler(request, session, context);
  };
}

/**
 * Require specific user type(s) for API routes - returns 403 if user type doesn't match
 * Use this to wrap API route handlers that need specific user types
 */
export function requireUserType<TContext = unknown>(
  ...allowedTypes: UserType[]
) {
  return (
    handler: (
      request: NextRequest,
      session: AuthSession,
      context: TContext,
    ) => Promise<NextResponse>,
  ) => {
    return requireAuth<TContext>(
      async (request: NextRequest, session: AuthSession, context: TContext) => {
        if (!allowedTypes.includes(session.user.userType)) {
          logger.warn(
            "User type not allowed - userId: {userId}, userType: {userType}, allowedTypes: {allowedTypes}",
            {
              userId: session.user.id,
              userType: session.user.userType,
              allowedTypes,
            },
          );
          return createErrorResponse("Insufficient permissions", {
            status: 403,
            code: "INSUFFICIENT_PERMISSIONS",
          });
        }

        return handler(request, session, context);
      },
    );
  };
}

/**
 * Convenience API route guards for specific user types
 */
export const requireAdmin = <TContext = unknown>(
  handler: (
    request: NextRequest,
    session: AuthSession,
    context: TContext,
  ) => Promise<NextResponse>,
) => requireUserType<TContext>("ADMIN")(handler);

export const requireStudent = <TContext = unknown>(
  handler: (
    request: NextRequest,
    session: AuthSession,
    context: TContext,
  ) => Promise<NextResponse>,
) => requireUserType<TContext>("STUDENT")(handler);

export const requireSchoolSupervisor = <TContext = unknown>(
  handler: (
    request: NextRequest,
    session: AuthSession,
    context: TContext,
  ) => Promise<NextResponse>,
) => requireUserType<TContext>("SCHOOL_SUPERVISOR")(handler);

export const requireIndustrySupervisor = <TContext = unknown>(
  handler: (
    request: NextRequest,
    session: AuthSession,
    context: TContext,
  ) => Promise<NextResponse>,
) => requireUserType<TContext>("INDUSTRY_SUPERVISOR")(handler);

export const requireAnySuper = <TContext = unknown>(
  handler: (
    request: NextRequest,
    session: AuthSession,
    context: TContext,
  ) => Promise<NextResponse>,
) =>
  requireUserType<TContext>(
    "SCHOOL_SUPERVISOR",
    "INDUSTRY_SUPERVISOR",
  )(handler);

export const requireStudentOrSupervisor = <TContext = unknown>(
  handler: (
    request: NextRequest,
    session: AuthSession,
    context: TContext,
  ) => Promise<NextResponse>,
) =>
  requireUserType<TContext>(
    "STUDENT",
    "SCHOOL_SUPERVISOR",
    "INDUSTRY_SUPERVISOR",
  )(handler);
