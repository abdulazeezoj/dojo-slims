import { createSuccessResponse, withErrorHandler } from "@/lib/api-response";
import { serverConfig } from "@/lib/config-server";
import { healthCheck } from "@/services/health";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return withErrorHandler(async () => {
    const { checks, ...summary } = await healthCheck();

    return createSuccessResponse({
      message: `Welcome to ${serverConfig.APP_NAME}`,
      ...summary,
    });
  });
}
