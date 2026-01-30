import { z } from "zod";

const envSchema = z.object({
  APP_NAME: z.string().default("SLIMS"),
  APP_VERSION: z.string().default("0.1.0"),
  APP_URL: z.string().default("http://localhost:3000"),
  LOG_LEVEL: z
    .enum(["debug", "info", "warn", "error", "fatal"])
    .default("info"),
  CSRF_COOKIE_NAME: z.string().default("csrf-client-token"),
  QUERY_POLLING_INTERVAL_MS: z.coerce.number().default(1000),
  QUERY_MAX_POLLING_ATTEMPTS: z.coerce.number().default(30),
});

type Env = z.infer<typeof envSchema>;

/**
 * Load and validate client-side environment variables
 */
function loadEnv(): Env {
  const rawEnv = {
    APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
    LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL,
    CSRF_COOKIE_NAME: process.env.NEXT_PUBLIC_CSRF_COOKIE_NAME,
    QUERY_POLLING_INTERVAL_MS: process.env.NEXT_PUBLIC_QUERY_POLLING_INTERVAL_MS,
    QUERY_MAX_POLLING_ATTEMPTS: process.env.NEXT_PUBLIC_QUERY_MAX_POLLING_ATTEMPTS,
  };

  return envSchema.parse(rawEnv);
}

export const clientConfig = loadEnv();
