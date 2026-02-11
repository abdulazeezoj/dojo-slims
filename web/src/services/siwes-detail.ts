import { randomUUID } from "crypto";

import { getLogger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import {
  industrySupervisorRepository,
  siwesSessionRepository,
  studentSessionEnrollmentRepository,
  studentSiwesDetailRepository,
  userRepository,
} from "@/repositories";

const logger = getLogger(["services", "siwes-detail"]);

/**
 * SIWES Details Service - Business logic for student SIWES details
 */
export class SiwesDetailService {
  /**
   * Get SIWES details for a student
   */
  async getSiwesDetails(studentId: string) {
    logger.info("Getting SIWES details", { studentId });

    const details = await studentSiwesDetailRepository.prisma.findMany({
      where: { studentId },
      include: {
        siwesSession: true,
        placementOrganization: true,
        industrySupervisor: {
          include: {
            user: true,
          },
        },
      },
    });
    return details;
  }

  /**
   * Create or update SIWES details
   * Also creates industry supervisor record if provided
   */
  async createOrUpdateSiwesDetails(
    studentId: string,
    sessionId: string,
    data: {
      placementOrganizationId: string;
      trainingStartDate: Date;
      trainingEndDate: Date;
      jobTitle?: string;
      departmentAtOrg?: string;
      industrySupervisor: {
        name: string;
        email: string;
        phone?: string;
        position?: string;
      };
    },
  ) {
    logger.info("Creating/updating SIWES details", { studentId, sessionId });

    // Check if enrollment exists
    const enrollment =
      await studentSessionEnrollmentRepository.findByStudentAndSession(
        studentId,
        sessionId,
      );

    if (!enrollment) {
      throw new Error("Student not enrolled in this session");
    }

    // Get session details for date validation
    const session = await siwesSessionRepository.prisma.findUnique({
      where: { id: sessionId },
    });
    if (!session) {
      throw new Error("SIWES session not found");
    }

    // Validate training date range
    const startDate = new Date(data.trainingStartDate);
    const endDate = new Date(data.trainingEndDate);
    const sessionStart = new Date(session.startDate);
    const sessionEnd = new Date(session.endDate);

    if (startDate >= endDate) {
      throw new Error("Training start date must be before training end date");
    }

    if (startDate < sessionStart) {
      throw new Error(
        `Training start date cannot be before session start date (${sessionStart.toLocaleDateString()})`,
      );
    }

    if (endDate > sessionEnd) {
      throw new Error(
        `Training end date cannot be after session end date (${sessionEnd.toLocaleDateString()})`,
      );
    }

    // Create or get industry supervisor (required in schema)
    const industrySupervisor = await this.createIndustrySupervisorFromDetails(
      data.placementOrganizationId,
      data.industrySupervisor,
    );

    // Check if SIWES details already exist
    const existing = await studentSiwesDetailRepository.findByStudentAndSession(
      studentId,
      sessionId,
    );

    if (existing) {
      // Update existing
      return studentSiwesDetailRepository.update(existing.id, {
        placementOrganization: {
          connect: { id: data.placementOrganizationId },
        },
        industrySupervisor: {
          connect: { id: industrySupervisor.id },
        },
        trainingStartDate: data.trainingStartDate,
        trainingEndDate: data.trainingEndDate,
        jobTitle: data.jobTitle,
        departmentAtOrg: data.departmentAtOrg,
      });
    } else {
      // Create new
      return studentSiwesDetailRepository.createSiwesDetail({
        student: {
          connect: { id: studentId },
        },
        siwesSession: {
          connect: { id: sessionId },
        },
        placementOrganization: {
          connect: { id: data.placementOrganizationId },
        },
        industrySupervisor: {
          connect: { id: industrySupervisor.id },
        },
        trainingStartDate: data.trainingStartDate,
        trainingEndDate: data.trainingEndDate,
        jobTitle: data.jobTitle,
        departmentAtOrg: data.departmentAtOrg,
      });
    }
  }

  /**
   * Create industry supervisor from SIWES details form
   * Creates user account for magic link authentication (passwordless)
   */
  async createIndustrySupervisorFromDetails(
    placementOrganizationId: string,
    supervisorData: {
      name: string;
      email: string;
      phone?: string;
      position?: string;
    },
  ) {
    logger.info("Creating industry supervisor from details", {
      email: supervisorData.email,
    });

    // Check if supervisor already exists by email
    const existing = await industrySupervisorRepository.findByEmailWithDetails(
      supervisorData.email,
    );

    if (existing) {
      logger.info("Industry supervisor already exists", {
        supervisorId: existing.id,
      });
      return existing;
    }

    // Check if user already exists (might be registered with different role)
    const existingUser = await userRepository.findByEmail(supervisorData.email);
    if (existingUser) {
      throw new Error(
        `User with email ${supervisorData.email} already exists with different role`,
      );
    }

    // Use transaction to ensure data consistency
    // Create User and IndustrySupervisor atomically
    const industrySupervisor = await prisma.$transaction(async (tx) => {
      const userId = randomUUID();

      // Create User record for magic link authentication
      await tx.user.create({
        data: {
          id: userId,
          email: supervisorData.email,
          name: supervisorData.name,
          emailVerified: false,
          userType: "INDUSTRY_SUPERVISOR",
        },
      });

      // Create industry supervisor record
      const newSupervisor = await tx.industrySupervisor.create({
        data: {
          name: supervisorData.name,
          email: supervisorData.email,
          phone: supervisorData.phone,
          position: supervisorData.position,
          placementOrganization: {
            connect: { id: placementOrganizationId },
          },
          user: {
            connect: { id: userId },
          },
        },
      });

      return newSupervisor;
    });

    logger.info("Created industry supervisor for magic link authentication", {
      supervisorId: industrySupervisor.id,
    });

    // Note: Magic link will be sent when industry supervisor needs to access the system
    // This is typically triggered when student submits their logbook for review
    // await notificationService.sendMagicLinkEmail({...})

    return industrySupervisor;
  }
}

export const siwesDetailService = new SiwesDetailService();
