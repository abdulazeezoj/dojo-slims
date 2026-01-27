import { Queue, QueueEvents } from "bullmq";
import { serverConfig } from "./config-server";
import { getLogger } from "./logger-server";

const logger = getLogger(["queue"]);

// Create queue instance
export const defaultQueue = new Queue(serverConfig.WORKER_DEFAULT_QUEUE, {
  connection: {
    url: serverConfig.WORKER_REDIS_URL,
    maxRetriesPerRequest: null,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: {
      age: 3600, // Keep completed jobs for 1 hour
      count: 1000,
    },
    removeOnFail: {
      age: 86400, // Keep failed jobs for 24 hours
      count: 5000,
    },
  },
});

// Queue events for monitoring
export const queueEvents = new QueueEvents(serverConfig.WORKER_DEFAULT_QUEUE, {
  connection: {
    url: serverConfig.WORKER_REDIS_URL,
    maxRetriesPerRequest: null,
  },
});

queueEvents.on("completed", ({ jobId }) => {
  logger.debug(`Job ${jobId} completed`);
});

queueEvents.on("failed", ({ jobId, failedReason }) => {
  logger.error(`Job ${jobId} failed`, { reason: failedReason });
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, closing queue...");
  await defaultQueue.close();
  await queueEvents.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received, closing queue...");
  await defaultQueue.close();
  await queueEvents.close();
  process.exit(0);
});
