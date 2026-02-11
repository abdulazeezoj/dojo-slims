import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin, magicLink, username } from "better-auth/plugins";

import { emailTemplates } from "../templates";
import { hashPassword, verifyPassword } from "./auth-utils";
import { config } from "./config";
import { getLogger } from "./logger";
import { mailer } from "./mailer";
import prisma from "./prisma";
import { createRedisClient } from "./redis";

const logger = getLogger(["lib", "auth"]);

const redis = createRedisClient();

/**
 * Redis-backed session cache with automatic TTL management
 */
export const sessionStore = {
  async get(key: string) {
    try {
      const data = await redis.get(key);
      if (!data) {
        return null;
      }
      // Parse the JSON data retrieved from Redis
      return JSON.parse(data);
    } catch (error) {
      logger.error("Failed to retrieve session from cache", { error });
      return null;
    }
  },

  async set(key: string, value: unknown, ttl?: number) {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await redis.setex(key, ttl, serialized);
        return;
      }

      await redis.set(key, serialized);
    } catch (error) {
      logger.error("Failed to cache session", { error });
    }
  },

  async delete(key: string) {
    try {
      await redis.del(key);
    } catch (error) {
      logger.error("Failed to delete session from cache", { error });
    }
  },
};

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    maxPasswordLength: 16,
    minPasswordLength: 8,
    password: {
      hash(password) {
        return hashPassword(password);
      },
      verify({ password, hash }) {
        return verifyPassword(password, hash);
      },
    },
    resetPasswordTokenExpiresIn: 15 * 60, // 15 minutes
    requireEmailVerification: false,
    revokeSessionsOnPasswordReset: true,
    // Send password reset email
    sendResetPassword: async ({ user, url }) => {
      try {
        const template = emailTemplates.getTemplate("password-reset", {
          recipientName: user.name,
          resetLink: url,
          expiryMinutes: "15",
        });

        await mailer.sendEmail({
          to: user.email,
          subject: "Reset Your Password - SLIMS",
          html: template.html,
          text: template.text,
        });

        logger.info("Password reset email sent", { userId: user.id });
      } catch (error) {
        logger.error("Failed to send password reset email", {
          userId: user.id,
          error,
        });
        throw error;
      }
    },

    // Send confirmation after password reset/change
    onPasswordReset: async ({ user }) => {
      try {
        const template = emailTemplates.getTemplate("password-changed", {
          recipientName: user.name,
          loginUrl: `${config.APP_URL}/auth/signin`,
          supportEmail: config.APP_SUPPORT_EMAIL,
        });

        await mailer.sendEmail({
          to: user.email,
          subject: "Password Changed Successfully - SLIMS",
          html: template.html,
          text: template.text,
        });

        logger.info("Password change confirmation sent", { userId: user.id });
      } catch (error) {
        logger.error("Failed to send password change confirmation", {
          userId: user.id,
          error,
        });
        // Don't throw - confirmation email failure shouldn't fail the password reset
      }
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  user: {
    additionalFields: {
      userType: {
        type: "string",
        required: true,
        input: false,
      },
    },
  },
  plugins: [
    magicLink({
      expiresIn: config.BETTER_AUTH_MAGIC_LINK_EXPIRY_M * 60,
      sendMagicLink: async ({ email, url, token }) => {
        try {
          const template = emailTemplates.getTemplate("magic-link", {
            recipientName: email,
            magicLink: url,
            magicLinkToken: token,
            expiryMinutes: config.BETTER_AUTH_MAGIC_LINK_EXPIRY_M,
          });

          await mailer.sendEmail({
            to: email,
            subject: "Sign in to SLIMS - Magic Link",
            html: template.html,
            text: template.text,
          });

          logger.info("Magic link email sent", { email });
        } catch (error) {
          logger.error("Failed to send magic link email", { email, error });
          throw error;
        }
      },
      disableSignUp: true,
    }),
    username({
      minUsernameLength: 3,
      maxUsernameLength: 30,
      usernameNormalization(username) {
        return username.trim().toUpperCase();
      },
      usernameValidator(username) {
        const pattern = /^[A-Z0-9\/]+$/;
        return pattern.test(username);
      },
    }),
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
    nextCookies(),
  ],
  secondaryStorage: sessionStore,
  advanced: {
    database: {
      generateId: "uuid",
    },
  },
  disablePaths: ["/is-username-available"],
});
