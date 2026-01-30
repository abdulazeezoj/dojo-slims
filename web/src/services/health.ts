import { config } from "@/lib/config";
import { getLogger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { defaultQueue } from "@/lib/queue";
import IORedis from "ioredis";

const logger = getLogger(["services", "health"]);

export interface HealthSummary {
  status: "healthy" | "unhealthy";
  timestamp: string;
  version: string;
}

export interface HealthDetails extends HealthSummary {
  checks: Record<string, any>;
}

export async function healthCheck(): Promise<HealthDetails> {
  const startTime = Date.now();
  const checks: Record<string, any> = {
    database: { status: "down" },
    redis: { status: "down" },
    queue: { status: "down" },
  };

  // Check Database
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    checks.database = {
      status: "up",
      responseTime: Date.now() - dbStart,
    };
  } catch (error) {
    logger.error("Database health check failed", { error });
    checks.database = {
      status: "down",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  // Check Redis
  let redisClient: IORedis | null = null;
  try {
    const redisStart = Date.now();
    redisClient = new IORedis(config.REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
    });
    await redisClient.ping();
    checks.redis = {
      status: "up",
      responseTime: Date.now() - redisStart,
    };
  } catch (error) {
    logger.error("Redis health check failed", { error });
    checks.redis = {
      status: "down",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  } finally {
    if (redisClient) {
      await redisClient.quit();
    }
  }

  // Check Queue
  try {
    const [waiting, active] = await Promise.all([
      defaultQueue.getWaitingCount(),
      defaultQueue.getActiveCount(),
    ]);
    checks.queue = {
      status: "up",
      waitingJobs: waiting,
      activeJobs: active,
    };
  } catch (error) {
    logger.error("Queue health check failed", { error });
    checks.queue = {
      status: "down",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  // Determine overall status
  const allUp = Object.values(checks).every((check) => check.status === "up");
  const anyDown = Object.values(checks).some(
    (check) => check.status === "down",
  );

  const status: HealthSummary["status"] = allUp ? "healthy" : "unhealthy";

  const duration = Date.now() - startTime;

  if (status === "unhealthy") {
    logger.warn("System health check failed", { duration, checks });
  }

  return {
    status,
    timestamp: new Date().toISOString(),
    version: config.APP_VERSION,
    checks,
  };
}
