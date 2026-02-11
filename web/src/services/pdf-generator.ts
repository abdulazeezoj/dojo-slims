/**
 * PDF Generator Service
 * Handles ITF-compliant logbook PDF generation
 */

import type { Student } from "@/generated/prisma/client";
import {
  studentRepository,
  studentSessionEnrollmentRepository,
  studentSiwesDetailRepository,
  weeklyEntryRepository,
  type WeeklyEntryWithRelations,
} from "@/repositories";
import PDFDocument from "pdfkit";
import { format } from "date-fns";

export class PdfGeneratorService {
  /**
   * Generate ITF-compliant PDF logbook for a student's session
   */
  async generateLogbookPdf(
    studentId: string,
    sessionId: string,
  ): Promise<Buffer> {
    // Get student with all related data
    const student = await studentRepository.prisma.findUnique({
      where: { id: studentId },
      include: {
        department: {
          include: {
            faculty: true,
          },
        },
      },
    });
    if (!student) {
      throw new Error("Student not found");
    }

    // Get all weekly entries for the session
    const weeklyEntries = await weeklyEntryRepository.findManyByStudentSession(
      studentId,
      sessionId,
    );

    // Get SIWES details and placement info
    const enrollment =
      await studentSessionEnrollmentRepository.prisma.findFirst({
        where: {
          studentId,
          siwesSessionId: sessionId,
        },
        include: {
          siwesSession: true,
        },
      });
    if (!enrollment) {
      throw new Error("Student enrollment not found for this session");
    }

    // Get student SIWES details (placement organization, industry supervisor)
    const siwesDetail =
      await studentSiwesDetailRepository.prisma.findFirst({
        where: {
          studentId,
          siwesSessionId: sessionId,
        },
        include: {
          placementOrganization: true,
          industrySupervisor: true,
        },
      });

    // Transform data to match expected types
    const transformedSiwesDetail = siwesDetail
      ? {
          placementOrganization: {
            name: siwesDetail.placementOrganization.name,
            address: siwesDetail.placementOrganization.address ?? undefined,
            city: siwesDetail.placementOrganization.city ?? undefined,
            state: siwesDetail.placementOrganization.state ?? undefined,
          },
          industrySupervisor: {
            name: siwesDetail.industrySupervisor.name,
            email: siwesDetail.industrySupervisor.email,
            position: siwesDetail.industrySupervisor.position ?? undefined,
            phone: siwesDetail.industrySupervisor.phone ?? undefined,
          },
          trainingStartDate: siwesDetail.trainingStartDate,
          trainingEndDate: siwesDetail.trainingEndDate,
          jobTitle: siwesDetail.jobTitle ?? undefined,
          departmentAtOrg: siwesDetail.departmentAtOrg ?? undefined,
        }
      : null;

    // Generate PDF document
    const pdfBuffer = await this.generatePdfDocument({
      student,
      weeklyEntries,
      enrollment,
      siwesDetail: transformedSiwesDetail,
    });

    return pdfBuffer;
  }

  /**
   * Generate PDF document with ITF compliance
   */
  private async generatePdfDocument(data: {
    student: Student;
    weeklyEntries: WeeklyEntryWithRelations[];
    enrollment: {
      siwesSession: {
        id: string;
        name: string;
        startDate: Date;
        endDate: Date;
        totalWeeks: number;
      };
    };
    siwesDetail: {
      placementOrganization: {
        name: string;
        address?: string;
        city?: string;
        state?: string;
      };
      industrySupervisor: {
        name: string;
        email: string;
        position?: string;
        phone?: string;
      };
      trainingStartDate: Date;
      trainingEndDate: Date;
      jobTitle?: string;
      departmentAtOrg?: string;
    } | null;
  }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: "A4",
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
        });

        const chunks: Buffer[] = [];
        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        // 1. Generate Cover Page
        this.generateCoverPage(doc, data);

        // 2. Generate SIWES Details Page
        if (data.siwesDetail) {
          doc.addPage();
          this.generateSiwesDetailsPage(doc, data);
        }

        // 3. Generate Weekly Entries (24 weeks)
        for (const entry of data.weeklyEntries) {
          doc.addPage();
          this.generateWeeklyEntryPage(doc, entry, data);
        }

        // 4. Generate Final Assessment Pages
        doc.addPage();
        this.generateFinalAssessmentPage(doc, data);

        // Finalize PDF
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate cover page
   */
  private generateCoverPage(
    doc: typeof PDFDocument.prototype,
    data: {
      student: Student;
      enrollment: {
        siwesSession: {
          name: string;
          startDate: Date;
          endDate: Date;
        };
      };
    },
  ): void {
    // Title
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("SIWES LOGBOOK", { align: "center" });

    doc.moveDown(2);

    // Institution
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("Ahmadu Bello University, Zaria", { align: "center" });

    doc.moveDown(1);

    doc
      .fontSize(12)
      .font("Helvetica")
      .text("Students Industrial Work Experience Scheme", { align: "center" });

    doc.moveDown(3);

    // Student Information
    const leftMargin = 100;
    doc.fontSize(12).font("Helvetica-Bold");

    doc.text("Student Information:", leftMargin);
    doc.moveDown(0.5);

    doc.font("Helvetica");
    doc.text(`Name: ${data.student.name}`, leftMargin);
    doc.text(`Matric Number: ${data.student.matricNumber}`, leftMargin);
    doc.text(`Email: ${data.student.email}`, leftMargin);

    doc.moveDown(1.5);

    // Session Information
    doc.font("Helvetica-Bold");
    doc.text("Session Information:", leftMargin);
    doc.moveDown(0.5);

    doc.font("Helvetica");
    doc.text(`Session: ${data.enrollment.siwesSession.name}`, leftMargin);
    doc.text(
      `Period: ${format(new Date(data.enrollment.siwesSession.startDate), "MMM d, yyyy")} - ${format(new Date(data.enrollment.siwesSession.endDate), "MMM d, yyyy")}`,
      leftMargin,
    );

    // Footer
    doc
      .fontSize(10)
      .font("Helvetica-Oblique")
      .text(
        "This logbook is property of Ahmadu Bello University",
        50,
        doc.page.height - 100,
        { align: "center" },
      );
  }

  /**
   * Generate SIWES details page
   */
  private generateSiwesDetailsPage(
    doc: typeof PDFDocument.prototype,
    data: {
      student: Student;
      siwesDetail: {
        placementOrganization: {
          name: string;
          address?: string;
          city?: string;
          state?: string;
        };
        industrySupervisor: {
          name: string;
          email: string;
          position?: string;
          phone?: string;
        };
        trainingStartDate: Date;
        trainingEndDate: Date;
        jobTitle?: string;
        departmentAtOrg?: string;
      } | null;
    },
  ): void {
    const leftMargin = 50;

    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text("SIWES Training Details", leftMargin);

    doc.moveDown(1.5);

    if (!data.siwesDetail) return;

    // Placement Organization
    doc.fontSize(14).font("Helvetica-Bold");
    doc.text("Placement Organization", leftMargin);
    doc.moveDown(0.5);

    doc.fontSize(12).font("Helvetica");
    doc.text(`Organization: ${data.siwesDetail.placementOrganization.name}`, leftMargin);
    if (data.siwesDetail.placementOrganization.address) {
      doc.text(`Address: ${data.siwesDetail.placementOrganization.address}`, leftMargin);
    }
    if (data.siwesDetail.placementOrganization.city) {
      doc.text(
        `City: ${data.siwesDetail.placementOrganization.city}, ${data.siwesDetail.placementOrganization.state || ""}`,
        leftMargin,
      );
    }

    doc.moveDown(1.5);

    // Industry Supervisor
    doc.fontSize(14).font("Helvetica-Bold");
    doc.text("Industry Supervisor", leftMargin);
    doc.moveDown(0.5);

    doc.fontSize(12).font("Helvetica");
    doc.text(`Name: ${data.siwesDetail.industrySupervisor.name}`, leftMargin);
    if (data.siwesDetail.industrySupervisor.position) {
      doc.text(`Position: ${data.siwesDetail.industrySupervisor.position}`, leftMargin);
    }
    doc.text(`Email: ${data.siwesDetail.industrySupervisor.email}`, leftMargin);
    if (data.siwesDetail.industrySupervisor.phone) {
      doc.text(`Phone: ${data.siwesDetail.industrySupervisor.phone}`, leftMargin);
    }

    doc.moveDown(1.5);

    // Training Details
    doc.fontSize(14).font("Helvetica-Bold");
    doc.text("Training Details", leftMargin);
    doc.moveDown(0.5);

    doc.fontSize(12).font("Helvetica");
    if (data.siwesDetail.jobTitle) {
      doc.text(`Job Title: ${data.siwesDetail.jobTitle}`, leftMargin);
    }
    if (data.siwesDetail.departmentAtOrg) {
      doc.text(`Department: ${data.siwesDetail.departmentAtOrg}`, leftMargin);
    }
    doc.text(
      `Training Period: ${format(new Date(data.siwesDetail.trainingStartDate), "MMM d, yyyy")} - ${format(new Date(data.siwesDetail.trainingEndDate), "MMM d, yyyy")}`,
      leftMargin,
    );
  }

  /**
   * Generate weekly entry page
   */
  private generateWeeklyEntryPage(
    doc: typeof PDFDocument.prototype,
    entry: WeeklyEntryWithRelations,
    data: {
      student: Student;
    },
  ): void {
    const leftMargin = 50;

    // Week header
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text(`Week ${entry.weekNumber}`, leftMargin);

    doc.moveDown(1);

    // Daily entries
    const days = [
      { label: "Monday", content: entry.mondayEntry },
      { label: "Tuesday", content: entry.tuesdayEntry },
      { label: "Wednesday", content: entry.wednesdayEntry },
      { label: "Thursday", content: entry.thursdayEntry },
      { label: "Friday", content: entry.fridayEntry },
      { label: "Saturday", content: entry.saturdayEntry },
    ];

    days.forEach((day) => {
      if (day.content) {
        doc.fontSize(12).font("Helvetica-Bold");
        doc.text(`${day.label}:`, leftMargin);
        doc.moveDown(0.3);

        doc.fontSize(10).font("Helvetica");
        doc.text(day.content, leftMargin + 20, undefined, {
          width: doc.page.width - leftMargin - 70,
        });
        doc.moveDown(0.8);
      }
    });

    // Diagrams
    if (entry.diagrams && entry.diagrams.length > 0) {
      doc.moveDown(1);
      doc.fontSize(12).font("Helvetica-Bold");
      doc.text("Diagrams:", leftMargin);
      doc.moveDown(0.5);

      entry.diagrams.forEach((diagram) => {
        doc.fontSize(10).font("Helvetica");
        doc.text(`- ${diagram.fileName}`, leftMargin + 20);
        if (diagram.caption) {
          doc.text(`  ${diagram.caption}`, leftMargin + 30);
        }
      });
    }

    // Supervisor Comments
    doc.moveDown(1.5);

    // Industry Supervisor Comments
    if (entry.industrySupervisorWeeklyComments && entry.industrySupervisorWeeklyComments.length > 0) {
      doc.fontSize(12).font("Helvetica-Bold");
      doc.text("Industry Supervisor Comments:", leftMargin);
      doc.moveDown(0.5);

      entry.industrySupervisorWeeklyComments.forEach(
        (comment) => {
          doc.fontSize(10).font("Helvetica");
          doc.text(comment.comment, leftMargin + 20, undefined, {
            width: doc.page.width - leftMargin - 70,
          });
          doc.fontSize(9).font("Helvetica-Oblique");
          doc.text(
            `- ${comment.industrySupervisor.name}, ${format(new Date(comment.commentedAt), "MMM d, yyyy")}`,
            leftMargin + 20,
          );
          doc.moveDown(0.5);
        },
      );
    }

    // School Supervisor Comments
    if (entry.schoolSupervisorWeeklyComments && entry.schoolSupervisorWeeklyComments.length > 0) {
      doc.moveDown(1);
      doc.fontSize(12).font("Helvetica-Bold");
      doc.text("School Supervisor Comments:", leftMargin);
      doc.moveDown(0.5);

      entry.schoolSupervisorWeeklyComments.forEach(
        (comment) => {
          doc.fontSize(10).font("Helvetica");
          doc.text(comment.comment, leftMargin + 20, undefined, {
            width: doc.page.width - leftMargin - 70,
          });
          doc.fontSize(9).font("Helvetica-Oblique");
          doc.text(
            `- ${comment.schoolSupervisor.name}, ${format(new Date(comment.commentedAt), "MMM d, yyyy")}`,
            leftMargin + 20,
          );
          doc.moveDown(0.5);
        },
      );
    }

    // Lock status
    if (entry.isLocked) {
      doc.moveDown(1);
      doc.fontSize(9).font("Helvetica-Oblique");
      doc.text(
        `This week is locked and cannot be edited.`,
        leftMargin,
        undefined,
        { align: "center" },
      );
    }
  }

  /**
   * Generate final assessment page
   */
  private generateFinalAssessmentPage(
    doc: typeof PDFDocument.prototype,
    data: {
      student: Student;
    },
  ): void {
    const leftMargin = 50;

    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text("Final Assessment", leftMargin);

    doc.moveDown(2);

    // Placeholder for final comments
    doc.fontSize(12).font("Helvetica");
    doc.text(
      "Final comments from industry and school supervisors will appear here.",
      leftMargin,
    );

    doc.moveDown(2);

    // Signature sections
    doc.fontSize(12).font("Helvetica-Bold");
    doc.text("Industry Supervisor Signature:", leftMargin);
    doc.moveDown(2);
    doc
      .moveTo(leftMargin, doc.y)
      .lineTo(leftMargin + 200, doc.y)
      .stroke();
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica");
    doc.text("Date: _________________", leftMargin);

    doc.moveDown(3);

    doc.fontSize(12).font("Helvetica-Bold");
    doc.text("School Supervisor Signature:", leftMargin);
    doc.moveDown(2);
    doc
      .moveTo(leftMargin, doc.y)
      .lineTo(leftMargin + 200, doc.y)
      .stroke();
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica");
    doc.text("Date: _________________", leftMargin);
  }

  /**
   * Generate bulk PDFs for all students in a session
   */
  async generateBulkLogbookPdfs(
    sessionId: string,
    filters?: {
      departmentId?: string;
    },
  ): Promise<{
    successful: number;
    failed: number;
    errors: Array<{ studentId: string; error: string }>;
    pdfUrls: Array<{ studentId: string; url: string }>;
  }> {
    let successful = 0;
    let failed = 0;
    const errors: Array<{ studentId: string; error: string }> = [];
    const pdfUrls: Array<{ studentId: string; url: string }> = [];

    // Get all enrolled students for the session
    const enrollments =
      await studentSessionEnrollmentRepository.findManyBySession(sessionId);

    // Filter students by department if specified
    let students = enrollments.map((e: { student: Student }) => e.student);
    if (filters?.departmentId) {
      students = students.filter(
        (s: Student) => s.departmentId === filters.departmentId,
      );
    }

    // Generate PDFs in batches
    const batchSize = 10;
    for (let i = 0; i < students.length; i += batchSize) {
      const batch = students.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (student: Student) => {
          try {
            const _pdfBuffer = await this.generateLogbookPdf(
              student.id,
              sessionId,
            );

            // TODO: Upload to cloud storage (S3, Azure Blob, etc.)
            // For now, use placeholder URL
            const url = `/pdfs/${sessionId}/${student.id}.pdf`;

            pdfUrls.push({
              studentId: student.id,
              url,
            });

            successful++;
          } catch (error) {
            errors.push({
              studentId: student.id,
              error:
                error instanceof Error
                  ? error.message
                  : "Unknown error occurred",
            });
            failed++;
          }
        }),
      );
    }

    return { successful, failed, errors, pdfUrls };
  }

  /**
   * Preview PDF for a specific week
   */
  async generateWeekPreviewPdf(weeklyEntryId: string): Promise<Buffer> {
    const weeklyEntry = await weeklyEntryRepository.prisma.findUnique({
      where: { id: weeklyEntryId },
      include: {
        student: {
          include: {
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        siwesSession: true,
        diagrams: true,
        schoolSupervisorWeeklyComments: {
          include: {
            schoolSupervisor: {
              include: {
                user: true,
              },
            },
          },
        },
        industrySupervisorWeeklyComments: {
          include: {
            industrySupervisor: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
    if (!weeklyEntry) {
      throw new Error("Weekly entry not found");
    }

    // Generate single-week PDF preview
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: "A4",
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
        });

        const chunks: Buffer[] = [];
        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        // Generate the weekly entry page
        // TypeScript doesn't recognize this includes all required properties from WeeklyEntryWithRelations
        // but it does, so we cast it
        this.generateWeeklyEntryPage(doc, weeklyEntry as unknown as WeeklyEntryWithRelations, {
          student: weeklyEntry.student,
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Get PDF generation status
   */
  async getPdfGenerationStatus(_jobId: string): Promise<{
    status: "pending" | "processing" | "completed" | "failed";
    progress: number;
    url?: string;
    error?: string;
  }> {
    // This would track background PDF generation jobs
    // TODO: Implement job status tracking with Redis/BullMQ
    return {
      status: "pending",
      progress: 0,
    };
  }

  /**
   * Validate logbook completeness before PDF generation
   */
  async validateLogbookCompleteness(
    studentId: string,
    sessionId: string,
  ): Promise<{
    isComplete: boolean;
    missingWeeks: number[];
    warnings: string[];
  }> {
    const weeklyEntries = await weeklyEntryRepository.findManyByStudentSession(
      studentId,
      sessionId,
    );

    // Check for 24 weeks
    const totalWeeks = 24;
    const existingWeeks = weeklyEntries.map(
      (entry: WeeklyEntryWithRelations) => entry.weekNumber,
    );
    const missingWeeks = Array.from(
      { length: totalWeeks },
      (_, i) => i + 1,
    ).filter((week) => !existingWeeks.includes(week));

    const warnings: string[] = [];

    // Check for missing activities
    const weeksWithoutActivities = weeklyEntries.filter(
      (entry: WeeklyEntryWithRelations) => {
        const hasAnyActivity =
          entry.mondayEntry ||
          entry.tuesdayEntry ||
          entry.wednesdayEntry ||
          entry.thursdayEntry ||
          entry.fridayEntry ||
          entry.saturdayEntry;
        return !hasAnyActivity;
      },
    );
    if (weeksWithoutActivities.length > 0) {
      warnings.push(
        `${weeksWithoutActivities.length} week(s) missing activities`,
      );
    }

    // Check for missing industry comments
    const weeksWithoutIndustryComments = weeklyEntries.filter(
      (entry: WeeklyEntryWithRelations) =>
        !entry.industrySupervisorWeeklyComments?.some(
          (c: { comment: string }) => c.comment,
        ),
    );
    if (weeksWithoutIndustryComments.length > 0) {
      warnings.push(
        `${weeksWithoutIndustryComments.length} week(s) missing industry supervisor comments`,
      );
    }

    // Check for missing school comments
    const weeksWithoutSchoolComments = weeklyEntries.filter(
      (entry: WeeklyEntryWithRelations) =>
        !entry.schoolSupervisorWeeklyComments?.some(
          (c: { comment: string }) => c.comment,
        ),
    );
    if (weeksWithoutSchoolComments.length > 0) {
      warnings.push(
        `${weeksWithoutSchoolComments.length} week(s) missing school supervisor comments`,
      );
    }

    const isComplete = missingWeeks.length === 0 && warnings.length === 0;

    return {
      isComplete,
      missingWeeks,
      warnings,
    };
  }

  /**
   * Generate PDF with custom branding
   */
  async generateCustomLogbookPdf(
    studentId: string,
    sessionId: string,
    options: {
      includeCoverPage?: boolean;
      includeSignatures?: boolean;
      watermark?: string;
      institutionLogo?: string;
    },
  ): Promise<Buffer> {
    // Get the standard PDF first
    const standardPdf = await this.generateLogbookPdf(studentId, sessionId);

    // For MVP, return standard PDF
    // Custom branding (watermarks, logos) can be implemented post-MVP
    // using pdf-lib or similar library to modify the PDF

    return standardPdf;
  }
}

export const pdfGeneratorService = new PdfGeneratorService();
