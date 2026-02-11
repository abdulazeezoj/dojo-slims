/**
 * Industry Supervisor Service
 * Business logic for industry supervisors (Features 14-17)
 */

import { getLogger } from "@/lib/logger";
import {
  industrySupervisorRepository,
  studentSiwesDetailRepository,
} from "@/repositories";

import { reviewService } from "./review";

const logger = getLogger(["services", "industry-supervisor"]);

export class IndustrySupervisorService {
  /**
   * Get industry supervisor dashboard data (Feature 14)
   */
  async getDashboard(supervisorId: string) {
    logger.info("Getting industry supervisor dashboard", { supervisorId });

    const supervisor =
      await industrySupervisorRepository.findDashboardData(supervisorId);
    if (!supervisor) {
      throw new Error("Industry supervisor not found");
    }

    // Get assigned students through SIWES details with session info
    const siwesDetails = await studentSiwesDetailRepository.prisma.findMany({
      where: {
        industrySupervisorId: supervisorId,
      },
      include: {
        student: {
          include: {
            user: true,
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        siwesSession: true,
      },
    });

    // Filter for active sessions only
    const activeDetails = siwesDetails.filter(
      (detail) => detail.siwesSession?.status === "ACTIVE",
    );

    const assignedStudents = activeDetails.map((detail) => detail.student);

    // Get pending reviews
    const pendingReviews = await this.getPendingReviews(supervisorId);

    return {
      supervisor,
      assignedStudents,
      pendingReviews,
      stats: {
        totalStudents: assignedStudents.length,
        pendingReviews: pendingReviews.length,
      },
    };
  }

  /**
   * List assigned students for industry supervisor (Feature 15)
   */
  async listAssignedStudents(supervisorId: string) {
    logger.info("Getting assigned students for industry supervisor", {
      supervisorId,
    });

    const supervisorData =
      await industrySupervisorRepository.findDashboardData(supervisorId);
    if (!supervisorData) {
      return [];
    }

    // Extract students from SIWES details
    return supervisorData.studentSiwesDetails.map((detail) => detail.student);
  }

  /**
   * Get industry supervisor profile (Feature 16)
   */
  async getProfile(supervisorId: string) {
    logger.info("Getting industry supervisor profile", { supervisorId });

    const supervisor = await industrySupervisorRepository.prisma.findUnique({
      where: { id: supervisorId },
      include: {
        placementOrganization: true,
        user: true,
      },
    });
    if (!supervisor) {
      throw new Error("Industry supervisor not found");
    }
    return supervisor;
  }

  /**
   * Update industry supervisor profile (Feature 16)
   */
  async updateProfile(
    supervisorId: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      position?: string;
    },
  ) {
    logger.info("Updating industry supervisor profile", { supervisorId, data });

    // Industry supervisors have: name, email, phone, position
    return industrySupervisorRepository.updateProfile(supervisorId, data);
  }

  /**
   * Get pending reviews for industry supervisor
   * Used to show weeks awaiting review
   */
  private async getPendingReviews(supervisorId: string) {
    logger.info("Getting pending industry reviews", { supervisorId });

    // Use reviewService to get pending review requests
    const pendingRequests =
      await reviewService.getPendingReviewRequests(supervisorId);

    // Map to expected format
    const pendingReviews = pendingRequests.map((request) => ({
      weekId: request.weeklyEntryId,
      studentId: request.studentId,
      weekNumber: request.weeklyEntry.weekNumber,
      startDate: request.requestedAt,
      endDate: request.requestedAt, // Using requestedAt as placeholder
    }));

    return pendingReviews;
  }
}

export const industrySupervisorService = new IndustrySupervisorService();
