import { createSuccessResponse, withErrorHandler } from "@/lib/api-response";
import { config } from "@/lib/config";
import { healthCheck } from "@/services/health";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return withErrorHandler(async () => {
    const { checks: _checks, ...summary } = await healthCheck();

    return createSuccessResponse({
      message: `Welcome to ${config.APP_NAME}`,
      ...summary,
    });
  });
}
