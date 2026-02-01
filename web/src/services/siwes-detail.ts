import { getLogger } from "@/lib/logger";
import {
  industrySupervisorRepository,
  siwesDetailRepository,
  studentEnrollmentRepository,
  userRepository,
} from "@/repositories";
import { randomUUID } from "crypto";

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

    const details = await siwesDetailRepository.findByStudent(studentId);
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
      await studentEnrollmentRepository.findByStudentAndSession(
        studentId,
        sessionId,
      );

    if (!enrollment) {
      throw new Error("Student not enrolled in this session");
    }

    // Create or get industry supervisor (required in schema)
    const industrySupervisor = await this.createIndustrySupervisorFromDetails(
      data.placementOrganizationId,
      data.industrySupervisor,
    );

    // Check if SIWES details already exist
    const existing = await siwesDetailRepository.findByStudentSession(
      studentId,
      sessionId,
    );

    if (existing) {
      // Update existing
      return siwesDetailRepository.update(existing.id, {
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
      return siwesDetailRepository.create({
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
    const existing = await industrySupervisorRepository.findByEmail(
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

    // Create User record directly for magic link authentication
    // Industry supervisors don't get passwords - they use magic link login
    const userId = randomUUID();
    const user = await userRepository.create({
      id: userId,
      email: supervisorData.email,
      name: supervisorData.name,
      emailVerified: false,
      userType: "INDUSTRY_SUPERVISOR",
      userReferenceId: "", // Will be updated after supervisor is created
    });

    // Create industry supervisor record
    const industrySupervisor = await industrySupervisorRepository.create({
      name: supervisorData.name,
      email: supervisorData.email,
      phone: supervisorData.phone,
      position: supervisorData.position,
      placementOrganization: {
        connect: { id: placementOrganizationId },
      },
      betterAuthUser: {
        connect: { id: user.id },
      },
    });

    // Update User with userReferenceId now that supervisor is created
    await userRepository.update(user.id, {
      userReferenceId: industrySupervisor.id,
    });

    logger.info("Created industry supervisor for magic link authentication", {
      supervisorId: industrySupervisor.id,
      userId: user.id,
    });

    // Note: Magic link will be sent when industry supervisor needs to access the system
    // This is typically triggered when student submits their logbook for review
    // await notificationService.sendMagicLinkEmail({...})

    return industrySupervisor;
  }
}

export const siwesDetailService = new SiwesDetailService();
