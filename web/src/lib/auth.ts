import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink, username } from "better-auth/plugins";
import Redis from "ioredis";

import { authService } from "../services/auth";
import { config } from "./config";
import { getLogger } from "./logger";
import prisma from "./prisma";

const logger = getLogger(["lib", "auth"]);

const redis = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,
});

redis.on("connect", () => {
  logger.info("Session cache connected");
});

redis.on("error", (error) => {
  logger.error("Session cache connection error", { error });
});

/**
 * Redis-backed session cache with automatic TTL management
 */
export const sessionStore = {
  async get(token: string) {
    try {
      const cached = await redis.get(`session:${token}`);
      if (cached) {
        return JSON.parse(cached);
      }
      return null;
    } catch (error) {
      logger.error("Failed to retrieve session from cache", { error });
      return null;
    }
  },

  async set(token: string, session: any, ttl: number) {
    try {
      await redis.setex(`session:${token}`, ttl, JSON.stringify(session));
    } catch (error) {
      logger.error("Failed to cache session", { error });
    }
  },

  async delete(token: string) {
    try {
      await redis.del(`session:${token}`);
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
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  plugins: [
    magicLink({
      expiresIn: config.BETTER_AUTH_MAGIC_LINK_EXPIRY_M * 60,
      sendMagicLink: async ({ email, url, token }, ctx) => {
        const result = await authService.sendMagicLink(email, url, token);

        if (!result.success) {
          logger.error("Failed to send magic link via auth service", {
            email,
            error: result.error,
          });
          throw new Error(result.error || "Failed to send magic link email");
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
  ],
  async onSession(session: any, request: any) {
    if (session) {
      const ttl = Math.floor(
        (new Date(session.expiresAt).getTime() - Date.now()) / 1000,
      );
      if (ttl > 0) {
        await sessionStore.set(session.token, session, ttl);
      }
    }
  },
  disablePaths: ["/is-username-available"],
});
