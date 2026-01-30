import { Queue, QueueEvents } from "bullmq";
import { config } from "./config";
import { getLogger } from "./logger";

const logger = getLogger(["queue"]);

export const defaultQueue = new Queue(config.WORKER_DEFAULT_QUEUE, {
  connection: {
    url: config.WORKER_REDIS_URL,
    maxRetriesPerRequest: null,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: {
      age: 3600,
      count: 1000,
    },
    removeOnFail: {
      age: 86400,
      count: 5000,
    },
  },
});

export const queueEvents = new QueueEvents(config.WORKER_DEFAULT_QUEUE, {
  connection: {
    url: config.WORKER_REDIS_URL,
    maxRetriesPerRequest: null,
  },
});

queueEvents.on("failed", ({ jobId, failedReason }) => {
  logger.error("Job failed", { jobId, reason: failedReason });
});

process.on("SIGTERM", async () => {
  logger.info("Shutting down queue");
  await defaultQueue.close();
  await queueEvents.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("Shutting down queue");
  await defaultQueue.close();
  await queueEvents.close();
  process.exit(0);
});
