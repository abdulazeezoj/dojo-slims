import { getLogger } from "@/lib/logger";
import { siwesSessionRepository } from "@/repositories";

const logger = getLogger(["services", "session"]);

/**
 * Session Service - Business logic for SIWES session management
 */
export class SessionService {
  /**
   * Get all sessions
   */
  async getAllSessions() {
    logger.info("Getting all sessions");

    return siwesSessionRepository.findAllWithStats({
      // No pagination limit - get all
    });
  }

  /**
   * Get session by ID
   */
  async getSessionById(sessionId: string) {
    logger.info("Getting session by ID", { sessionId });

    const session = await siwesSessionRepository.findByIdWithStats(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    return session;
  }

  /**
   * Create new session
   */
  async createSession(data: {
    name: string;
    startDate: Date;
    endDate: Date;
    totalWeeks?: number;
  }) {
    logger.info("Creating session", { name: data.name });

    // Validate dates
    if (data.startDate >= data.endDate) {
      throw new Error("Start date must be before end date");
    }

    // Check if session with same name already exists
    const exists = await siwesSessionRepository.existsByName(data.name);
    if (exists) {
      throw new Error("Session with this name already exists");
    }

    return siwesSessionRepository.create({
      name: data.name,
      startDate: data.startDate,
      endDate: data.endDate,
      totalWeeks: data.totalWeeks || 24,
      status: "ACTIVE",
    });
  }

  /**
   * Update session
   */
  async updateSession(
    sessionId: string,
    data: {
      name?: string;
      startDate?: Date;
      endDate?: Date;
      totalWeeks?: number;
    },
  ) {
    logger.info("Updating session", { sessionId });

    const session = await siwesSessionRepository.findByIdWithStats(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    // Validate dates if provided
    const startDate = data.startDate || session.startDate;
    const endDate = data.endDate || session.endDate;

    if (startDate >= endDate) {
      throw new Error("Start date must be before end date");
    }

    // Check if name is being changed and if it conflicts with existing session
    if (data.name && data.name !== session.name) {
      const exists = await siwesSessionRepository.existsByName(data.name);
      if (exists) {
        throw new Error("Session with this name already exists");
      }
    }

    return siwesSessionRepository.update(sessionId, data);
  }

  /**
   * Close session
   */
  async closeSession(sessionId: string) {
    logger.info("Closing session", { sessionId });

    const session = await siwesSessionRepository.findByIdWithStats(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    if (session.status === "CLOSED") {
      throw new Error("Session is already closed");
    }

    return siwesSessionRepository.closeSession(sessionId);
  }

  /**
   * Reopen session
   */
  async reopenSession(sessionId: string) {
    logger.info("Reopening session", { sessionId });

    const session = await siwesSessionRepository.findByIdWithStats(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    if (session.status === "ACTIVE") {
      throw new Error("Session is already active");
    }

    return siwesSessionRepository.reopenSession(sessionId);
  }

  /**
   * Get active session
   */
  async getActiveSession() {
    logger.info("Getting active session");

    return siwesSessionRepository.findActiveSession();
  }

  /**
   * Get sessions by status
   */
  async getSessionsByStatus(status: "ACTIVE" | "CLOSED") {
    logger.info("Getting sessions by status", { status });

    if (status === "ACTIVE") {
      return siwesSessionRepository.findAllActive();
    } else {
      return siwesSessionRepository.findAllClosed();
    }
  }
}

export const sessionService = new SessionService();
