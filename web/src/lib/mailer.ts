import nodemailer, { type Transporter } from "nodemailer";

import { config } from "./config";
import { getLogger } from "./logger";

const logger = getLogger(["lib", "mailer"]);

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

interface BulkEmailOptions {
  recipients: Array<{
    email: string;
    variables: Record<string, string | number>;
  }>;
  subject: string;
  htmlTemplate: string;
  textTemplate?: string;
  from?: string;
}

/**
 * Mailer class for sending emails using SMTP
 */
class Mailer {
  private transporter: Transporter | null = null;

  /**
   * Initialize transporter lazily
   */
  private getTransporter(): Transporter {
    if (!this.transporter) {
      this.transporter = this.createTransporter();
    }

    return this.transporter;
  }

  /**
   * Create SMTP transporter
   */
  private createTransporter(): Transporter {
    return nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      secure: config.SMTP_SECURE,
      auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS,
      },
    });
  }

  /**
   * Render template with variables
   */
  private renderTemplate(
    template: string,
    variables: Record<string, string | number>,
  ): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key]?.toString() || match;
    });
  }

  /**
   * Send email using configured SMTP provider
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const transporter = this.getTransporter();
      const from =
        options.from ||
        `"${config.SMTP_FROM_NAME}" <${config.SMTP_FROM_EMAIL}>`;

      const info = await transporter.sendMail({
        from,
        to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ""),
        replyTo: options.replyTo,
      });

      logger.info("Email sent", {
        messageId: info.messageId,
        to: options.to,
      });
    } catch (error) {
      logger.error("Failed to send email", {
        to: options.to,
        subject: options.subject,
        error,
      });
      throw error;
    }
  }

  /**
   * Send templated email with variable substitution
   */
  async sendTemplatedEmail(
    to: string | string[],
    subject: string,
    htmlTemplate: string,
    textTemplate: string | undefined,
    variables: Record<string, string | number>,
    from?: string,
  ): Promise<void> {
    const html = this.renderTemplate(htmlTemplate, variables);
    const text = textTemplate
      ? this.renderTemplate(textTemplate, variables)
      : undefined;

    await this.sendEmail({ to, subject, html, text, from });
  }

  /**
   * Send bulk emails with personalized variables
   */
  async sendBulkEmails(options: BulkEmailOptions): Promise<{
    success: number;
    failed: number;
    errors: Array<{ email: string; error: string }>;
  }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ email: string; error: string }>,
    };

    for (const recipient of options.recipients) {
      try {
        await this.sendTemplatedEmail(
          recipient.email,
          options.subject,
          options.htmlTemplate,
          options.textTemplate,
          recipient.variables,
          options.from,
        );
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          email: recipient.email,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        logger.error("Failed to send bulk email", {
          email: recipient.email,
          error,
        });
      }
    }

    logger.info("Bulk email send completed", results);
    return results;
  }

  /**
   * Verify SMTP connection
   */
  async verifyConnection(): Promise<boolean> {
    try {
      const transporter = this.getTransporter();
      await transporter.verify();
      logger.info("SMTP connection verified");
      return true;
    } catch (error) {
      logger.error("SMTP verification failed", { error });
      return false;
    }
  }
}

export const mailer = new Mailer();

export type { BulkEmailOptions, EmailOptions };
