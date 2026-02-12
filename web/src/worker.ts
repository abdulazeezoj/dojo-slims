#!/usr/bin/env node

import { Worker } from "bullmq";

import { config } from "./lib/config";
import { getLogger } from "./lib/logger";
import { defaultQueue } from "./lib/queue";

const logger = getLogger(["worker"]);

// Import task processors
import { taskHandlers } from "./tasks";

// Import scheduled jobs
import { scheduledJobs } from "./schedules";

// Initialize scheduled jobs
async function initializeScheduledJobs() {
  logger.info("Initializing scheduled jobs...");

  for (const job of scheduledJobs) {
    try {
      await defaultQueue.add(job.taskName, job.data || {}, {
        jobId: job.name,
        repeat: {
          pattern: job.repeat.pattern,
        },
        removeOnComplete: true,
        removeOnFail: false,
      });
      logger.info(
        `Scheduled job registered: ${job.name} (${job.repeat.pattern})`,
      );
    } catch (error) {
      logger.error(`Failed to register scheduled job: ${job.name}`, { error });
    }
  }
}

// Create worker
const worker = new Worker(
  config.WORKER_DEFAULT_QUEUE,
  async (job) => {
    logger.info(`Processing job ${job.id} of type ${job.name}`);

    const processor = taskHandlers[job.name];
    if (!processor) {
      throw new Error(`No processor found for task type: ${job.name}`);
    }

    try {
      const result = await processor(job.data);
      return result;
    } catch (error) {
      logger.error(`Job ${job.id} failed`, { error });
      throw error;
    }
  },
  {
    connection: {
      url: config.WORKER_REDIS_URL,
      maxRetriesPerRequest: null, // Required for BullMQ
    },
    concurrency: config.WORKER_CONCURRENCY,
    limiter: {
      max: config.WORKER_LIMITER_MAX,
      duration: config.WORKER_LIMITER_DURATION,
    },
  },
);

// Worker event handlers
worker.on("ready", async () => {
  logger.info(
    `Worker started and ready to process jobs from queue: ${config.WORKER_DEFAULT_QUEUE}`,
  );
  // Initialize scheduled jobs after worker is ready
  await initializeScheduledJobs();
});

worker.on("failed", (job, err) => {
  if (!job) {
    logger.error("Job failed without ID", { error: err });
  }
});

worker.on("error", (err) => {
  logger.error("Worker error:", err);
});

// Graceful shutdown
const shutdown = async () => {
  logger.info("Shutting down worker...");
  await worker.close();
  logger.info("Worker closed successfully");
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  logger.fatal("Uncaught exception", { error });
  shutdown();
});

process.on("unhandledRejection", (reason, promise) => {
  logger.fatal("Unhandled rejection", { promise, reason });
  shutdown();
});
