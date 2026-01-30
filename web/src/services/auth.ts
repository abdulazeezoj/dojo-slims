import { config } from "../lib/config";
import { getLogger } from "../lib/logger";
import { mailer } from "../lib/mailer";
import prisma from "../lib/prisma";
import { emailTemplates } from "../templates";

const logger = getLogger(["services", "auth"]);

/**
 * Auth Service
 * Handles authentication-related business logic and email notifications
 */
class AuthService {
  /**
   * Send personalized magic link email to user
   */
  async sendMagicLink(
    email: string,
    magicLink: string,
    magicLinkToken: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await prisma.user.findFirst({
        where: { email },
        select: { name: true, userType: true, isActive: true },
      });

      if (!user) {
        logger.warn("Magic link requested for non-existent user", { email });
        // Don't reveal user doesn't exist for security
        return { success: true };
      }

      if (!user.isActive) {
        logger.warn("Magic link requested for inactive user", { email });
        return {
          success: false,
          error: "User account is inactive",
        };
      }

      // Get magic link template
      const template = emailTemplates.getTemplate("magic-link", {
        recipientName: user.name || "User",
        magicLink,
        magicLinkToken,
        expiryMinutes: config.BETTER_AUTH_MAGIC_LINK_EXPIRY_M,
      });

      // Send email
      await mailer.sendEmail({
        to: email,
        subject: "Sign in to SLIMS - Magic Link",
        html: template.html,
        text: template.text,
      });

      logger.info("Magic link sent successfully", {
        email,
        userType: user.userType,
      });

      return { success: true };
    } catch (error) {
      logger.error("Failed to send magic link", { email, error });
      return {
        success: false,
        error: "Failed to send magic link email",
      };
    }
  }

  /**
   * Verify if user account is active
   */
  async verifyUserStatus(
    email: string,
  ): Promise<{ isActive: boolean; userType?: string }> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { isActive: true, userType: true },
      });

      if (!user) {
        return { isActive: false };
      }

      return {
        isActive: user.isActive,
        userType: user.userType,
      };
    } catch (error) {
      logger.error("Failed to verify user status", { email, error });
      return { isActive: false };
    }
  }
}

export const authService = new AuthService();
