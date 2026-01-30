import { z } from "zod";

const envSchema = z.object({
  APP_NAME: z.string().default("SLIMS"),
  APP_URL: z.string().default("http://localhost:3000"),
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
  RATE_LIMIT_ENABLED: z.coerce.boolean().default(true),
  RATE_LIMIT_REDIS_URL: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  RATE_LIMIT_SKIP_SUCCESS_RESPONSES: z.coerce.boolean().default(false),
  CSRF_SECRET: z
    .string()
    .min(32, "CSRF secret must be at least 32 characters")
    .default("super-secret-development"),
  CSRF_COOKIE_NAME: z.string().default("csrf-token"),
  CSRF_CLIENT_COOKIE_NAME: z.string().default("csrf-client-token"),
  CSRF_TOKEN_EXPIRY_M: z.coerce.number().default(60),
  WORKER_REDIS_URL: z.string().default("redis://localhost:6379"),
  WORKER_DEFAULT_QUEUE: z.string().default("dojo-slims"),
  WORKER_CONCURRENCY: z.coerce.number().default(5),
  WORKER_LIMITER_MAX: z.coerce.number().default(10),
  WORKER_LIMITER_DURATION: z.coerce.number().default(1000),
  BETTER_AUTH_SECRET: z.string().default("super-secret-development-key"),
  BETTER_AUTH_URL: z.string().default("http://localhost:3000"),
  BETTER_AUTH_MAGIC_LINK_EXPIRY_M: z.coerce.number().default(15),
  SMTP_HOST: z.string().default("smtp.gmail.com"),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: z.coerce.boolean().default(false),
  SMTP_USER: z.string().default(""),
  SMTP_PASS: z.string().default(""),
  SMTP_FROM_NAME: z.string().default("SLIMS"),
  SMTP_FROM_EMAIL: z.string().default("noreply@slims.edu.ng"),
  BASE_UPLOAD_PATH: z.string().default("./uploads"),
  MAX_FILE_SIZE: z.coerce.number().default(5242880),
  ALLOWED_MIME_TYPES: z
    .string()
    .default("image/jpeg,image/png,image/gif,application/pdf"),
  QUERY_POLLING_INTERVAL_MS: z.coerce.number().default(1000),
  QUERY_MAX_POLLING_ATTEMPTS: z.coerce.number().default(30),
  CORS_ALLOWED_ORIGINS: z
    .array(z.string())
    .default(["http://localhost:3000", "http://localhost:3001"]),
  SECURITY_ENABLE_HSTS: z.coerce.boolean().default(false),
  SECURITY_ENABLE_CSP: z.coerce.boolean().default(true),
  SECURITY_CSP_REPORT_URI: z.string().optional(),
});

type Env = z.infer<typeof envSchema>;

/**
 * Load and validate server-side environment variables
 */
function loadEnv(): Env {
  const rawEnv = {
    APP_NAME: process.env.APP_NAME || process.env.NEXT_PUBLIC_APP_NAME,
    APP_URL: process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL,
    APP_VERSION: process.env.APP_VERSION || process.env.NEXT_PUBLIC_APP_VERSION,
    NODE_ENV: process.env.NODE_ENV,
    LOG_LEVEL: process.env.LOG_LEVEL || process.env.NEXT_PUBLIC_LOG_LEVEL,
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
    RATE_LIMIT_ENABLED: process.env.RATE_LIMIT_ENABLED,
    RATE_LIMIT_REDIS_URL: process.env.RATE_LIMIT_REDIS_URL,
    RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
    RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS,
    RATE_LIMIT_SKIP_SUCCESS_RESPONSES:
      process.env.RATE_LIMIT_SKIP_SUCCESS_RESPONSES,
    CSRF_SECRET: process.env.CSRF_SECRET,
    CSRF_COOKIE_NAME: process.env.CSRF_COOKIE_NAME,
    CSRF_TOKEN_EXPIRY_M: process.env.CSRF_TOKEN_EXPIRY_M,
    WORKER_DEFAULT_QUEUE: process.env.WORKER_DEFAULT_QUEUE,
    WORKER_REDIS_URL: process.env.WORKER_REDIS_URL,
    WORKER_CONCURRENCY: process.env.WORKER_CONCURRENCY,
    WORKER_LIMITER_MAX: process.env.WORKER_LIMITER_MAX,
    WORKER_LIMITER_DURATION: process.env.WORKER_LIMITER_DURATION,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    BETTER_AUTH_MAGIC_LINK_EXPIRY_M:
      process.env.BETTER_AUTH_MAGIC_LINK_EXPIRY_M,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_SECURE: process.env.SMTP_SECURE,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_FROM_NAME: process.env.SMTP_FROM_NAME,
    SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL,
    BASE_UPLOAD_PATH: process.env.BASE_UPLOAD_PATH,
    MAX_FILE_SIZE: process.env.MAX_FILE_SIZE,
    ALLOWED_MIME_TYPES: process.env.ALLOWED_MIME_TYPES,
    QUERY_POLLING_INTERVAL_MS:
      process.env.QUERY_POLLING_INTERVAL_MS ||
      process.env.NEXT_PUBLIC_QUERY_POLLING_INTERVAL_MS,
    QUERY_MAX_POLLING_ATTEMPTS:
      process.env.QUERY_MAX_POLLING_ATTEMPTS ||
      process.env.NEXT_PUBLIC_QUERY_MAX_POLLING_ATTEMPTS,
    CORS_ALLOWED_ORIGINS: process.env.CORS_ALLOWED_ORIGINS
      ? process.env.CORS_ALLOWED_ORIGINS.split(",").map((o) => o.trim())
      : undefined,
    SECURITY_ENABLE_HSTS: process.env.SECURITY_ENABLE_HSTS,
    SECURITY_ENABLE_CSP: process.env.SECURITY_ENABLE_CSP,
    SECURITY_CSP_REPORT_URI: process.env.SECURITY_CSP_REPORT_URI,
  };

  const parsedEnv = envSchema.parse(rawEnv);

  // Security: Enforce strong CSRF secret in production
  if (
    parsedEnv.NODE_ENV === "production" &&
    parsedEnv.CSRF_SECRET === "super-secret-development"
  ) {
    throw new Error(
      "CRITICAL SECURITY ERROR: CSRF_SECRET must be set to a strong random value in production. Generate one with: openssl rand -hex 32",
    );
  }

  return parsedEnv;
}

export const config = loadEnv();
