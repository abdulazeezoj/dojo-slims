"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getLogger } from "@/lib/logger";

const logger = getLogger(["lib", "auth-actions"]);

/**
 * Sign out the current user (Server Action)
 * Use this in server components with forms or buttons
 */
export async function signOutAction() {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });

    logger.info("User signed out successfully");
  } catch (error) {
    logger.error("Failed to sign out user", { error });
    throw error;
  }

  redirect("/auth");
}
