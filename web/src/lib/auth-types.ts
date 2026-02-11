/**
 * Shared authentication types used across API routes and server components
 */

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
  role: string;
  isActive: boolean;
}

export interface AuthSession {
  token: string;
  userId: string;
  expiresAt: Date;
  user: AuthUser;
}
