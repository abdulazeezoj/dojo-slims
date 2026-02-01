import { auth } from "@/lib/auth";
import { config } from "@/lib/config";
import { prisma } from "@/lib/db";
import { getLogger } from "@/lib/logger";
import { mailer } from "@/lib/mailer";
import { emailTemplates } from "@/templates";

const logger = getLogger(["services", "password"]);

/**
 * Password Management Service
 * Handles password changes, reset requests, and validation using Better Auth
 */
export class PasswordService {
  /**
   * Change password for authenticated user
   * Requires current password for verification
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Get user account
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { accounts: true },
      });

      if (!user || !user.accounts || user.accounts.length === 0) {
        throw new Error("User account not found");
      }

      const account = user.accounts[0];

      // Verify current password using Better Auth
      const isValid = await auth.api.verifyPassword({
        password: currentPassword,
        hash: account.password || "",
      });

      if (!isValid) {
        return {
          success: false,
          message: "Current password is incorrect",
        };
      }

      // Hash new password
      const hashedPassword = await auth.api.hashPassword(newPassword);

      // Update password in database
      await prisma.account.update({
        where: { id: account.id },
        data: { password: hashedPassword },
      });

      // Send confirmation email
      const template = emailTemplates.getTemplate("password-changed", {
        recipientName: user.name,
        loginUrl: `${config.APP_URL}/auth/signin`,
        supportEmail: config.SUPPORT_EMAIL,
      });

      await mailer.sendEmail({
        to: user.email,
        subject: "Password Changed Successfully",
        html: template.html,
        text: template.text,
      });

      logger.info("Password changed successfully", { userId });

      return {
        success: true,
        message: "Password changed successfully",
      };
    } catch (error) {
      logger.error("Password change failed", { userId, error });
      throw error;
    }
  }

  /**
   * Request password reset (sends reset link via email)
   */
  async requestPasswordReset(email: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
      });

      // Always return success to avoid email enumeration
      if (!user) {
        logger.warn("Password reset requested for non-existent email", {
          email,
        });
        return {
          success: true,
          message:
            "If an account exists with this email, a reset link has been sent",
        };
      }

      // Generate reset token using Better Auth verification table
      const token = await this.generateResetToken(user.id);

      // Send reset email
      const resetLink = `${config.APP_URL}/auth/reset-password?token=${token}`;
      const template = emailTemplates.getTemplate("password-reset", {
        recipientName: user.name,
        resetLink,
        expiryMinutes: "15",
      });

      await mailer.sendEmail({
        to: user.email,
        subject: "Reset Your Password - SLIMS",
        html: template.html,
        text: template.text,
      });

      logger.info("Password reset email sent", { userId: user.id });

      return {
        success: true,
        message:
          "If an account exists with this email, a reset link has been sent",
      };
    } catch (error) {
      logger.error("Password reset request failed", { email, error });
      throw error;
    }
  }

  /**
   * Reset password using token
   */
  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Verify token and get user ID
      const verification = await prisma.verification.findFirst({
        where: {
          value: token,
          expiresAt: { gt: new Date() },
        },
      });

      if (!verification) {
        return {
          success: false,
          message: "Invalid or expired reset token",
        };
      }

      const userId = verification.identifier;

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { accounts: true },
      });

      if (!user || !user.accounts || user.accounts.length === 0) {
        throw new Error("User account not found");
      }

      // Hash new password
      const hashedPassword = await auth.api.hashPassword(newPassword);

      // Update password
      await prisma.account.update({
        where: { id: user.accounts[0].id },
        data: { password: hashedPassword },
      });

      // Delete verification token
      await prisma.verification.delete({
        where: { id: verification.id },
      });

      // Send confirmation email
      const template = emailTemplates.getTemplate("password-changed", {
        recipientName: user.name,
        loginUrl: `${config.APP_URL}/auth/signin`,
        supportEmail: config.SUPPORT_EMAIL,
      });

      await mailer.sendEmail({
        to: user.email,
        subject: "Password Reset Successfully",
        html: template.html,
        text: template.text,
      });

      logger.info("Password reset successfully", { userId });

      return {
        success: true,
        message: "Password reset successfully",
      };
    } catch (error) {
      logger.error("Password reset failed", { error });
      throw error;
    }
  }

  /**
   * Generate password reset token
   */
  private async generateResetToken(userId: string): Promise<string> {
    const crypto = await import("crypto");
    const token = crypto.randomBytes(32).toString("hex");

    // Store in verification table with 15-minute expiry
    await prisma.verification.create({
      data: {
        identifier: userId,
        value: token,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      },
    });

    return token;
  }

  /**
   * Set initial password (for admin-created accounts)
   * Does not require current password
   */
  async setInitialPassword(
    userId: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { accounts: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Hash password
      const hashedPassword = await auth.api.hashPassword(newPassword);

      // Update or create account
      if (user.accounts && user.accounts.length > 0) {
        await prisma.account.update({
          where: { id: user.accounts[0].id },
          data: { password: hashedPassword },
        });
      } else {
        await prisma.account.create({
          data: {
            userId: user.id,
            accountId: user.id,
            providerId: "credential",
            password: hashedPassword,
          },
        });
      }

      logger.info("Initial password set", { userId });

      return {
        success: true,
        message: "Password set successfully",
      };
    } catch (error) {
      logger.error("Failed to set initial password", { userId, error });
      throw error;
    }
  }

  /**
   * Validate password strength
   */
  validatePasswordStrength(password: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const passwordService = new PasswordService();
