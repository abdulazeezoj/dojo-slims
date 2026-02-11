import { config } from "@/lib/config";
import { getLogger } from "@/lib/logger";
import { mailer } from "@/lib/mailer";
import { emailTemplates } from "@/templates";

const logger = getLogger(["services", "notifications"]);

/**
 * Email Notification Service
 * Handles all system email notifications
 */
export class NotificationService {
  /**
   * Send welcome email with account credentials
   */
  async sendWelcomeEmail(data: {
    email: string;
    name: string;
    userType: string;
    loginCredential: string;
    temporaryPassword?: string;
  }): Promise<void> {
    try {
      const template = emailTemplates.getTemplate("welcome-account", {
        recipientName: data.name,
        userType: data.userType,
        loginCredential: data.loginCredential,
        loginUrl: `${config.APP_URL}/auth`,
        supportEmail: config.APP_SUPPORT_EMAIL,
      });

      await mailer.sendEmail({
        to: data.email,
        subject: "Welcome to SLIMS - Your Account is Ready",
        html: template.html,
        text: template.text,
      });

      logger.info("Welcome email sent", { email: data.email });
    } catch (error) {
      logger.error("Failed to send welcome email", {
        email: data.email,
        error,
      });
    }
  }

  /**
   * Send magic link to industry supervisor
   */
  async sendMagicLinkEmail(data: {
    email: string;
    name: string;
    magicLink: string;
  }): Promise<void> {
    try {
      const template = emailTemplates.getTemplate("magic-link", {
        recipientName: data.name,
        magicLink: data.magicLink,
        expiryMinutes: "5",
      });

      await mailer.sendEmail({
        to: data.email,
        subject: "Sign in to SLIMS - Industry Supervisor Portal",
        html: template.html,
        text: template.text,
      });

      logger.info("Magic link sent", { email: data.email });
    } catch (error) {
      logger.error("Failed to send magic link", { email: data.email, error });
    }
  }

  /**
   * Notify industry supervisor they've been linked to a student
   */
  async notifyIndustrySupervisorLinked(data: {
    email: string;
    supervisorName: string;
    studentName: string;
    matricNumber: string;
    organization: string;
  }): Promise<void> {
    try {
      const template = emailTemplates.getTemplate(
        "industry-supervisor-linked",
        {
          supervisorName: data.supervisorName,
          studentName: data.studentName,
          matricNumber: data.matricNumber,
          organization: data.organization,
          loginUrl: `${config.APP_URL}/auth/login/industry-supervisor`,
          supportEmail: config.APP_SUPPORT_EMAIL,
        },
      );

      await mailer.sendEmail({
        to: data.email,
        subject: "New Student Assigned - SLIMS",
        html: template.html,
        text: template.text,
      });

      logger.info("Industry supervisor linked notification sent", {
        email: data.email,
      });
    } catch (error) {
      logger.error("Failed to send supervisor linked notification", { error });
    }
  }

  /**
   * Notify school supervisor they've been assigned to a student
   */
  async notifySchoolSupervisorAssigned(data: {
    email: string;
    supervisorName: string;
    studentName: string;
    matricNumber: string;
    sessionName: string;
  }): Promise<void> {
    try {
      const template = emailTemplates.getTemplate(
        "school-supervisor-assigned",
        {
          supervisorName: data.supervisorName,
          studentName: data.studentName,
          matricNumber: data.matricNumber,
          sessionName: data.sessionName,
          loginUrl: `${config.APP_URL}/auth/login/school-supervisor`,
          supportEmail: config.APP_SUPPORT_EMAIL,
        },
      );

      await mailer.sendEmail({
        to: data.email,
        subject: "Student Assignment Notification - SLIMS",
        html: template.html,
        text: template.text,
      });

      logger.info("School supervisor assignment notification sent", {
        email: data.email,
      });
    } catch (error) {
      logger.error("Failed to send supervisor assignment notification", {
        error,
      });
    }
  }

  /**
   * Notify student about supervisor assignment
   */
  async notifyStudentSupervisorAssigned(data: {
    email: string;
    studentName: string;
    supervisorName: string;
    supervisorEmail: string;
    sessionName: string;
  }): Promise<void> {
    try {
      const template = emailTemplates.getTemplate(
        "student-supervisor-assigned",
        {
          studentName: data.studentName,
          supervisorName: data.supervisorName,
          supervisorEmail: data.supervisorEmail,
          sessionName: data.sessionName,
          loginUrl: `${config.APP_URL}/auth/login/student`,
          supportEmail: config.APP_SUPPORT_EMAIL,
        },
      );

      await mailer.sendEmail({
        to: data.email,
        subject: "Your Supervisor Has Been Assigned - SLIMS",
        html: template.html,
        text: template.text,
      });

      logger.info("Student supervisor assignment notification sent", {
        email: data.email,
      });
    } catch (error) {
      logger.error("Failed to send student assignment notification", { error });
    }
  }

  /**
   * Notify industry supervisor of pending review request
   */
  async notifyIndustrySupervisorReviewRequest(data: {
    email: string;
    supervisorName: string;
    studentName: string;
    weekNumber: number;
    reviewUrl: string;
  }): Promise<void> {
    try {
      const template = emailTemplates.getTemplate("review-request-industry", {
        supervisorName: data.supervisorName,
        studentName: data.studentName,
        weekNumber: data.weekNumber.toString(),
        reviewUrl: data.reviewUrl,
        supportEmail: config.APP_SUPPORT_EMAIL,
      });

      await mailer.sendEmail({
        to: data.email,
        subject: `Review Request for Week ${data.weekNumber} - ${data.studentName}`,
        html: template.html,
        text: template.text,
      });

      logger.info("Industry supervisor review request sent", {
        email: data.email,
      });
    } catch (error) {
      logger.error("Failed to send review request", { error });
    }
  }

  /**
   * Notify student when supervisor adds a comment
   */
  async notifyStudentCommentReceived(data: {
    email: string;
    studentName: string;
    supervisorName: string;
    supervisorType: string;
    weekNumber: number;
    viewUrl: string;
  }): Promise<void> {
    try {
      const template = emailTemplates.getTemplate("comment-received-student", {
        studentName: data.studentName,
        supervisorName: data.supervisorName,
        supervisorType: data.supervisorType,
        weekNumber: data.weekNumber.toString(),
        viewUrl: data.viewUrl,
        supportEmail: config.APP_SUPPORT_EMAIL,
      });

      await mailer.sendEmail({
        to: data.email,
        subject: `New Comment on Week ${data.weekNumber} - SLIMS`,
        html: template.html,
        text: template.text,
      });

      logger.info("Student comment notification sent", { email: data.email });
    } catch (error) {
      logger.error("Failed to send comment notification", { error });
    }
  }

  /**
   * Notify student when week is locked
   */
  async notifyStudentWeekLocked(data: {
    email: string;
    studentName: string;
    supervisorName: string;
    weekNumber: number;
    reason?: string;
  }): Promise<void> {
    try {
      const template = emailTemplates.getTemplate("week-locked-notification", {
        studentName: data.studentName,
        supervisorName: data.supervisorName,
        weekNumber: data.weekNumber.toString(),
        reason: data.reason || "Review completed",
        supportEmail: config.APP_SUPPORT_EMAIL,
      });

      await mailer.sendEmail({
        to: data.email,
        subject: `Week ${data.weekNumber} Locked - SLIMS`,
        html: template.html,
        text: template.text,
      });

      logger.info("Week locked notification sent", { email: data.email });
    } catch (error) {
      logger.error("Failed to send week locked notification", { error });
    }
  }

  /**
   * Notify student about session enrollment
   */
  async notifyStudentEnrollment(data: {
    email: string;
    studentName: string;
    sessionName: string;
    startDate: string;
    endDate: string;
  }): Promise<void> {
    try {
      const template = emailTemplates.getTemplate(
        "session-enrollment-student",
        {
          studentName: data.studentName,
          sessionName: data.sessionName,
          startDate: data.startDate,
          endDate: data.endDate,
          loginUrl: `${config.APP_URL}/auth/login/student`,
          supportEmail: config.APP_SUPPORT_EMAIL,
        },
      );

      await mailer.sendEmail({
        to: data.email,
        subject: `Enrolled in ${data.sessionName} - SLIMS`,
        html: template.html,
        text: template.text,
      });

      logger.info("Student enrollment notification sent", {
        email: data.email,
      });
    } catch (error) {
      logger.error("Failed to send enrollment notification", { error });
    }
  }

  /**
   * Notify supervisor about session enrollment
   */
  async notifySupervisorEnrollment(data: {
    email: string;
    supervisorName: string;
    sessionName: string;
    startDate: string;
    endDate: string;
  }): Promise<void> {
    try {
      const template = emailTemplates.getTemplate(
        "session-enrollment-supervisor",
        {
          supervisorName: data.supervisorName,
          sessionName: data.sessionName,
          startDate: data.startDate,
          endDate: data.endDate,
          loginUrl: `${config.APP_URL}/auth/login/school-supervisor`,
          supportEmail: config.APP_SUPPORT_EMAIL,
        },
      );

      await mailer.sendEmail({
        to: data.email,
        subject: `Enrolled in ${data.sessionName} - SLIMS`,
        html: template.html,
        text: template.text,
      });

      logger.info("Supervisor enrollment notification sent", {
        email: data.email,
      });
    } catch (error) {
      logger.error("Failed to send supervisor enrollment notification", {
        error,
      });
    }
  }

  /**
   * Request final comment from industry supervisor
   */
  async requestFinalCommentIndustry(data: {
    email: string;
    supervisorName: string;
    studentName: string;
    sessionName: string;
    submitUrl: string;
  }): Promise<void> {
    try {
      const template = emailTemplates.getTemplate(
        "review-request-final-industry",
        {
          supervisorName: data.supervisorName,
          studentName: data.studentName,
          sessionName: data.sessionName,
          submitUrl: data.submitUrl,
          supportEmail: config.APP_SUPPORT_EMAIL,
        },
      );

      await mailer.sendEmail({
        to: data.email,
        subject: `Final Assessment Request - ${data.studentName}`,
        html: template.html,
        text: template.text,
      });

      logger.info("Final comment request sent to industry supervisor", {
        email: data.email,
      });
    } catch (error) {
      logger.error("Failed to send final comment request", { error });
    }
  }

  /**
   * Request final comment from school supervisor
   */
  async requestFinalCommentSchool(data: {
    email: string;
    supervisorName: string;
    studentName: string;
    sessionName: string;
    submitUrl: string;
  }): Promise<void> {
    try {
      const template = emailTemplates.getTemplate(
        "review-request-final-school",
        {
          supervisorName: data.supervisorName,
          studentName: data.studentName,
          sessionName: data.sessionName,
          submitUrl: data.submitUrl,
          supportEmail: config.APP_SUPPORT_EMAIL,
        },
      );

      await mailer.sendEmail({
        to: data.email,
        subject: `Final Assessment Request - ${data.studentName}`,
        html: template.html,
        text: template.text,
      });

      logger.info("Final comment request sent to school supervisor", {
        email: data.email,
      });
    } catch (error) {
      logger.error("Failed to send final comment request", { error });
    }
  }

  /**
   * Send bulk welcome emails (for bulk uploads)
   */
  async sendBulkWelcomeEmails(
    users: Array<{
      email: string;
      name: string;
      userType: string;
      loginCredential: string;
      temporaryPassword?: string;
    }>,
  ): Promise<{ success: number; failed: number }> {
    const results = {
      success: 0,
      failed: 0,
    };

    for (const user of users) {
      try {
        await this.sendWelcomeEmail(user);
        results.success++;
      } catch (error) {
        results.failed++;
        logger.error("Bulk welcome email failed", { email: user.email, error });
      }
    }

    logger.info("Bulk welcome emails completed", results);
    return results;
  }
}

export const notificationService = new NotificationService();
