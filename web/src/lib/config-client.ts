import { z } from "zod";

const clientEnvSchema = z.object({
  APP_NAME: z.string().default("SLIMS"),
  APP_VERSION: z.string().default("0.1.0"),
  LOG_LEVEL: z
    .enum(["debug", "info", "warn", "error", "fatal"])
    .default("info"),
});

type ClientEnv = z.infer<typeof clientEnvSchema>;

// Load environment variables with NEXT_PUBLIC_ prefix and strip it
function loadClientEnv(): ClientEnv {
  const rawEnv = {
    APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
    LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL,
  };

  return clientEnvSchema.parse(rawEnv);
}

export const clientConfig = loadClientEnv();
