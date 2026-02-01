import { apiResponse } from "@/lib/api-response";
import { requireAuth } from "@/middlewares/auth";
import { adminDashboardService } from "@/services";
import { NextRequest } from "next/server";

/**
 * GET /api/admin/dashboard/activities
 * Get recent system activities
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request, ["ADMIN"]);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const { searchParams } = request.nextUrl;
    const limit = parseInt(searchParams.get("limit") || "20");

    const activities = await adminDashboardService.getRecentActivities(limit);
    return apiResponse.success(
      activities,
      "Recent activities retrieved successfully",
    );
  } catch (error) {
    return apiResponse.error(
      error instanceof Error ? error.message : "Failed to fetch activities",
    );
  }
}
