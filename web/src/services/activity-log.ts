import type { ActivityLog, UserType } from "@/generated/prisma/client";
import { getLogger } from "@/lib/logger";
import { activityLogRepository } from "@/repositories";

const logger = getLogger(["services", "activity-log"]);

/**
 * Activity Log Service - Business logic for activity logging and audit trail
 */
export class ActivityLogService {
  /**
   * Log a user action
   */
  async logActivity(data: {
    userType: UserType;
    userId: string;
    action: string;
    entityType?: string;
    entityId?: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
  }): Promise<ActivityLog> {
    try {
      const activity = await activityLogRepository.create(data);
      logger.info(`Activity logged: ${data.action} by ${data.userType} ${data.userId}`);
      return activity;
    } catch (error) {
      logger.error(`Failed to log activity: ${error}`);
      throw error;
    }
  }

  /**
   * Get recent activities
   */
  async getRecentActivities(limit = 20): Promise<ActivityLog[]> {
    try {
      return await activityLogRepository.findRecent({ take: limit });
    } catch (error) {
      logger.error(`Failed to get recent activities: ${error}`);
      throw error;
    }
  }

  /**
   * Get activities by user
   */
  async getUserActivities(
    userType: UserType,
    userId: string,
    limit = 20,
  ): Promise<ActivityLog[]> {
    try {
      return await activityLogRepository.findByUser(userType, userId, {
        take: limit,
      });
    } catch (error) {
      logger.error(
        `Failed to get activities for user ${userType} ${userId}: ${error}`,
      );
      throw error;
    }
  }

  /**
   * Get activities by entity
   */
  async getEntityActivities(
    entityType: string,
    entityId: string,
    limit = 20,
  ): Promise<ActivityLog[]> {
    try {
      return await activityLogRepository.findByEntity(
        entityType,
        entityId,
        { take: limit },
      );
    } catch (error) {
      logger.error(
        `Failed to get activities for entity ${entityType} ${entityId}: ${error}`,
      );
      throw error;
    }
  }

  /**
   * Get activities by action type
   */
  async getActionActivities(action: string, limit = 20): Promise<ActivityLog[]> {
    try {
      return await activityLogRepository.findByAction(action, { take: limit });
    } catch (error) {
      logger.error(`Failed to get activities for action ${action}: ${error}`);
      throw error;
    }
  }

  /**
   * Get activity statistics
   */
  async getActivityStats(): Promise<{
    totalActivities: number;
    byUserType: Record<string, number>;
    byAction: Record<string, number>;
  }> {
    try {
      const totalActivities = await activityLogRepository.count();

      // Get counts by user type
      const userTypes: UserType[] = [
        "ADMIN",
        "STUDENT",
        "SCHOOL_SUPERVISOR",
        "INDUSTRY_SUPERVISOR",
      ];
      const byUserType: Record<string, number> = {};
      for (const userType of userTypes) {
        byUserType[userType] = await activityLogRepository.count({ userType });
      }

      // Get counts for common actions
      const commonActions = [
        "login",
        "logout",
        "create",
        "update",
        "delete",
        "view",
      ];
      const byAction: Record<string, number> = {};
      for (const action of commonActions) {
        byAction[action] = await activityLogRepository.count({ action });
      }

      return {
        totalActivities,
        byUserType,
        byAction,
      };
    } catch (error) {
      logger.error(`Failed to get activity stats: ${error}`);
      throw error;
    }
  }

  /**
   * Clean up old activity logs (older than specified date)
   */
  async cleanupOldActivities(olderThanDate: Date): Promise<number> {
    try {
      const deletedCount =
        await activityLogRepository.deleteOlderThan(olderThanDate);
      logger.info(
        `Cleaned up ${deletedCount} activity logs older than ${olderThanDate}`,
      );
      return deletedCount;
    } catch (error) {
      logger.error(`Failed to cleanup old activities: ${error}`);
      throw error;
    }
  }
}

export const activityLogService = new ActivityLogService();
