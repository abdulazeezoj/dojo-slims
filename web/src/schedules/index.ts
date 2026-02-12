/**
 * Scheduled job configuration
 * Each job defines the task name and repeat pattern
 */

export interface ScheduledJob {
  name: string;
  taskName: string;
  repeat: {
    pattern: string; // Cron pattern
  };
  data?: unknown;
}

/**
 * List of all scheduled jobs
 * Jobs are automatically registered when the worker starts
 */
export const scheduledJobs: ScheduledJob[] = [
  {
    name: "cleanup-exports-hourly",
    taskName: "exports.cleanup",
    repeat: {
      pattern: "0 * * * *", // Every hour at minute 0
    },
  },
];
