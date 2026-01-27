import { z } from "zod";

const serverEnvSchema = z.object({
  APP_NAME: z.string().default("SLIMS"),
  APP_VERSION: z.string().default("0.1.0"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  LOG_LEVEL: z
    .enum(["debug", "info", "warn", "error", "fatal"])
    .default("info"),
  DATABASE_URL: z
    .string()
    .default("postgresql://admin:password@localhost:5432/dojo-slims"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  WORKER_REDIS_URL: z.string().default("redis://localhost:6379"),
  WORKER_DEFAULT_QUEUE: z.string().default("dojo-slims"),
  WORKER_CONCURRENCY: z.coerce.number().default(5),
  WORKER_LIMITER_MAX: z.coerce.number().default(10),
  WORKER_LIMITER_DURATION: z.coerce.number().default(1000),
});

type ServerEnv = z.infer<typeof serverEnvSchema>;

// Load all environment variables and strip NEXT_PUBLIC_ prefix where present
function loadServerEnv(): ServerEnv {
  const rawEnv = {
    APP_NAME: process.env.APP_NAME,
    APP_VERSION: process.env.APP_VERSION,
    NODE_ENV: process.env.NODE_ENV,
    LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL || process.env.LOG_LEVEL,
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
    WORKER_DEFAULT_QUEUE: process.env.WORKER_DEFAULT_QUEUE,
    WORKER_REDIS_URL: process.env.WORKER_REDIS_URL,
    WORKER_CONCURRENCY: process.env.WORKER_CONCURRENCY,
    WORKER_LIMITER_MAX: process.env.WORKER_LIMITER_MAX,
    WORKER_LIMITER_DURATION: process.env.WORKER_LIMITER_DURATION,
  };

  const parsed = serverEnvSchema.parse(rawEnv);

  return parsed;
}

export const serverConfig = loadServerEnv();
