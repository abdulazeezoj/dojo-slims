import Redis from "ioredis";

import { config } from "./config";
import { getLogger } from "./logger";

const logger = getLogger(["lib", "redis"]);

/**
 * Shared Redis client instance for application-wide use
 */
export const redis = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on("error", (error) => {
  logger.error("Redis connection error", { error });
});

redis.on("close", () => {
  logger.warn("Redis connection closed");
});

/**
 * Create a new Redis client instance for specific use cases
 * @param url Optional Redis URL (defaults to config.REDIS_URL)
 */
export function createRedisClient(url?: string): Redis {
  const client = new Redis(url || config.REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

  client.on("error", (error) => {
    logger.error("Redis client connection error", { error });
  });

  client.on("close", () => {
    logger.warn("Redis client connection closed");
  });

  return client;
}

/**
 * Gracefully close Redis connection
 */
export async function closeRedis(): Promise<void> {
  try {
    await redis.quit();
  } catch (error) {
    logger.error("Error closing Redis connection", { error });
  }
}
