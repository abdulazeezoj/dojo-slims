import {
  createErrorResponse,
  createSuccessResponse,
  withErrorHandler,
} from "@/lib/api-response";
import { healthCheck } from "@/services/health";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return withErrorHandler(async () => {
    const { checks: _, ...summary } = await healthCheck();

    const statusCode = summary.status === "unhealthy" ? 503 : 200;

    if (summary.status === "unhealthy") {
      return createErrorResponse("System is unhealthy", {
        status: 503,
        code: "UNHEALTHY",
        details: summary,
      });
    }

    return createSuccessResponse(summary, { status: statusCode });
  });
}
