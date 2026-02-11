/**
 * PDF Generator Service
 * Handles ITF-compliant logbook PDF generation
 */

import PDFDocument from "pdfkit";
import type { Student } from "@/generated/prisma/client";
import {
  studentRepository,
  studentSessionEnrollmentRepository,
  studentSiwesDetailRepository,
  weeklyEntryRepository,
  industrySupervisorFinalCommentRepository,
  schoolSupervisorFinalCommentRepository,
  type WeeklyEntryWithRelations,
} from "@/repositories";

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
      await studentSessionEnrollmentRepository.findByStudentAndSession(
        studentId,
        sessionId,
      );
    if (!enrollment) {
      throw new Error("Student enrollment not found for this session");
    }

    // Get student SIWES details (placement organization, industry supervisor)
    const siwesDetail =
      await studentSiwesDetailRepository.findByStudentAndSession(
        studentId,
        sessionId,
      );

    // Get final comments from both supervisors
    const industryFinalComment =
      await industrySupervisorFinalCommentRepository.prisma.findFirst({
        where: {
          studentId,
          siwesSessionId: sessionId,
        },
        include: {
          industrySupervisor: true,
        },
      });

    const schoolFinalComment =
      await schoolSupervisorFinalCommentRepository.prisma.findFirst({
        where: {
          studentId,
          siwesSessionId: sessionId,
        },
        include: {
          schoolSupervisor: true,
        },
      });

    // Generate PDF document
    const pdfBuffer = await this.generatePdfDocument({
      student,
      weeklyEntries,
      enrollment,
      siwesDetail,
      industryFinalComment,
      schoolFinalComment,
    });

    return pdfBuffer;
  }

  /**
   * Generate PDF document with ITF compliance
   */
  private async generatePdfDocument(data: {
    student: Student & {
      department: {
        name: string;
        faculty: { name: string };
      };
    };
    weeklyEntries: WeeklyEntryWithRelations[];
    enrollment: { siwesSession: { name: string; startDate: Date; endDate: Date } };
    siwesDetail: {
      placementOrganization: { name: string; address?: string | null };
      industrySupervisor: {
        name: string;
        email: string;
        phone?: string | null;
        position?: string | null;
      };
      trainingStartDate: Date;
      trainingEndDate: Date;
      jobTitle?: string | null;
      departmentAtOrg?: string | null;
    } | null;
    industryFinalComment: {
      comment: string;
      rating?: string | null;
      commentedAt: Date;
      industrySupervisor: { name: string; position?: string | null };
    } | null;
    schoolFinalComment: {
      comment: string;
      rating?: string | null;
      commentedAt: Date;
      schoolSupervisor: { name: string; staffId: string };
    } | null;
  }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: "A4",
          margins: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50,
          },
        });

        const chunks: Buffer[] = [];
        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        // Generate PDF content
        this.generateCoverPage(doc, data);
        doc.addPage();
        this.generateSiwesDetails(doc, data);
        doc.addPage();
        this.generateWeeklyEntries(doc, data);
        this.generateFinalAssessments(doc, data);
        
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
      student: Student & {
        department: {
          name: string;
          faculty: { name: string };
        };
      };
      enrollment: { siwesSession: { name: string; startDate: Date; endDate: Date } };
    },
  ): void {
    // Title
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("SIWES LOGBOOK", { align: "center" })
      .moveDown(1);

    // Institution
    doc
      .fontSize(16)
      .font("Helvetica")
      .text("Ahmadu Bello University, Zaria", { align: "center" })
      .moveDown(0.5);

    doc
      .fontSize(14)
      .text("Students' Industrial Work Experience Scheme", { align: "center" })
      .moveDown(2);

    // Student Information
    doc.fontSize(12).font("Helvetica-Bold").text("STUDENT INFORMATION", {
      underline: true,
    });
    doc.moveDown(0.5);

    doc.font("Helvetica");
    const studentInfo = [
      ["Name:", data.student.name],
      ["Matric Number:", data.student.matricNumber],
      ["Faculty:", data.student.department.faculty.name],
      ["Department:", data.student.department.name],
      ["Email:", data.student.email],
    ];

    for (const [label, value] of studentInfo) {
      doc.font("Helvetica-Bold").text(label, { continued: true });
      doc.font("Helvetica").text(` ${value}`);
    }

    doc.moveDown(2);

    // Session Information
    doc.fontSize(12).font("Helvetica-Bold").text("SESSION INFORMATION", {
      underline: true,
    });
    doc.moveDown(0.5);

    doc.font("Helvetica");
    const sessionInfo = [
      ["Session:", data.enrollment.siwesSession.name],
      [
        "Start Date:",
        new Date(data.enrollment.siwesSession.startDate).toLocaleDateString(),
      ],
      [
        "End Date:",
        new Date(data.enrollment.siwesSession.endDate).toLocaleDateString(),
      ],
    ];

    for (const [label, value] of sessionInfo) {
      doc.font("Helvetica-Bold").text(label, { continued: true });
      doc.font("Helvetica").text(` ${value}`);
    }

    doc.moveDown(2);

    // Footer
    doc
      .fontSize(10)
      .text(
        `Generated on: ${new Date().toLocaleDateString()}`,
        { align: "center" },
      );
  }

  /**
   * Generate SIWES details page
   */
  private generateSiwesDetails(
    doc: typeof PDFDocument.prototype,
    data: {
      siwesDetail: {
        placementOrganization: { name: string; address?: string | null };
        industrySupervisor: {
          name: string;
          email: string;
          phone?: string | null;
          position?: string | null;
        };
        trainingStartDate: Date;
        trainingEndDate: Date;
        jobTitle?: string | null;
        departmentAtOrg?: string | null;
      } | null;
    },
  ): void {
    doc.fontSize(16).font("Helvetica-Bold").text("PLACEMENT INFORMATION", {
      underline: true,
    });
    doc.moveDown(1);

    if (!data.siwesDetail) {
      doc
        .fontSize(12)
        .font("Helvetica")
        .text("No placement information available.");
      return;
    }

    doc.fontSize(12).font("Helvetica");

    const placementInfo = [
      ["Organization:", data.siwesDetail.placementOrganization.name],
      [
        "Address:",
        data.siwesDetail.placementOrganization.address || "Not specified",
      ],
      ["Department:", data.siwesDetail.departmentAtOrg || "Not specified"],
      ["Job Title:", data.siwesDetail.jobTitle || "Not specified"],
      [
        "Training Start:",
        new Date(data.siwesDetail.trainingStartDate).toLocaleDateString(),
      ],
      [
        "Training End:",
        new Date(data.siwesDetail.trainingEndDate).toLocaleDateString(),
      ],
    ];

    for (const [label, value] of placementInfo) {
      doc.font("Helvetica-Bold").text(label, { continued: true });
      doc.font("Helvetica").text(` ${value}`);
    }

    doc.moveDown(2);

    // Industry Supervisor
    doc.fontSize(14).font("Helvetica-Bold").text("INDUSTRY SUPERVISOR", {
      underline: true,
    });
    doc.moveDown(0.5);

    doc.fontSize(12).font("Helvetica");
    const supervisorInfo = [
      ["Name:", data.siwesDetail.industrySupervisor.name],
      [
        "Position:",
        data.siwesDetail.industrySupervisor.position || "Not specified",
      ],
      ["Email:", data.siwesDetail.industrySupervisor.email],
      [
        "Phone:",
        data.siwesDetail.industrySupervisor.phone || "Not specified",
      ],
    ];

    for (const [label, value] of supervisorInfo) {
      doc.font("Helvetica-Bold").text(label, { continued: true });
      doc.font("Helvetica").text(` ${value}`);
    }
  }

  /**
   * Generate weekly entries
   */
  private generateWeeklyEntries(
    doc: typeof PDFDocument.prototype,
    data: { weeklyEntries: WeeklyEntryWithRelations[] },
  ): void {
    const sortedEntries = [...data.weeklyEntries].sort(
      (a, b) => a.weekNumber - b.weekNumber,
    );

    for (const entry of sortedEntries) {
      doc.addPage();
      doc.fontSize(16).font("Helvetica-Bold").text(`WEEK ${entry.weekNumber}`, {
        underline: true,
      });
      doc.moveDown(1);

      // Daily entries
      const days = [
        ["Monday", entry.mondayEntry],
        ["Tuesday", entry.tuesdayEntry],
        ["Wednesday", entry.wednesdayEntry],
        ["Thursday", entry.thursdayEntry],
        ["Friday", entry.fridayEntry],
        ["Saturday", entry.saturdayEntry],
      ];

      doc.fontSize(12).font("Helvetica");

      for (const [day, content] of days) {
        doc.font("Helvetica-Bold").text(`${day}:`, { continued: false });
        if (content) {
          doc.font("Helvetica").text(content, {
            indent: 20,
          });
        } else {
          doc.font("Helvetica-Oblique").text("No entry recorded", {
            indent: 20,
          });
        }
        doc.moveDown(0.5);
      }

      doc.moveDown(1);

      // Diagrams
      if (entry.diagrams && entry.diagrams.length > 0) {
        doc.font("Helvetica-Bold").text("Diagrams/Illustrations:");
        for (const diagram of entry.diagrams) {
          doc.font("Helvetica").text(`- ${diagram.fileName}`, { indent: 20 });
          if (diagram.caption) {
            doc
              .font("Helvetica-Oblique")
              .text(`  Caption: ${diagram.caption}`, { indent: 30 });
          }
        }
        doc.moveDown(1);
      }

      // Industry Supervisor Comments
      if (
        entry.industrySupervisorWeeklyComments &&
        entry.industrySupervisorWeeklyComments.length > 0
      ) {
        doc.font("Helvetica-Bold").text("Industry Supervisor Comments:");
        for (const comment of entry.industrySupervisorWeeklyComments) {
          doc.font("Helvetica").text(comment.comment, { indent: 20 });
          doc
            .fontSize(10)
            .font("Helvetica-Oblique")
            .text(
              `- ${comment.industrySupervisor.name} (${new Date(comment.commentedAt).toLocaleDateString()})`,
              { indent: 20 },
            );
          doc.fontSize(12);
        }
        doc.moveDown(1);
      }

      // School Supervisor Comments
      if (
        entry.schoolSupervisorWeeklyComments &&
        entry.schoolSupervisorWeeklyComments.length > 0
      ) {
        doc.font("Helvetica-Bold").text("School Supervisor Comments:");
        for (const comment of entry.schoolSupervisorWeeklyComments) {
          doc.font("Helvetica").text(comment.comment, { indent: 20 });
          doc
            .fontSize(10)
            .font("Helvetica-Oblique")
            .text(
              `- ${comment.schoolSupervisor.name} (${new Date(comment.commentedAt).toLocaleDateString()})`,
              { indent: 20 },
            );
          doc.fontSize(12);
        }
        doc.moveDown(1);
      }

      // Lock status
      if (entry.isLocked) {
        doc
          .fontSize(10)
          .font("Helvetica-Oblique")
          .text(`[Week locked - ${entry.lockedBy || "system"}]`, {
            align: "right",
          });
        doc.fontSize(12);
      }
    }
  }

  /**
   * Generate final assessments
   */
  private generateFinalAssessments(
    doc: typeof PDFDocument.prototype,
    data: {
      industryFinalComment: {
        comment: string;
        rating?: string | null;
        commentedAt: Date;
        industrySupervisor: { name: string; position?: string | null };
      } | null;
      schoolFinalComment: {
        comment: string;
        rating?: string | null;
        commentedAt: Date;
        schoolSupervisor: { name: string; staffId: string };
      } | null;
    },
  ): void {
    doc.addPage();
    doc.fontSize(16).font("Helvetica-Bold").text("FINAL ASSESSMENTS", {
      underline: true,
    });
    doc.moveDown(1);

    // Industry Supervisor Final Comment
    doc.fontSize(14).font("Helvetica-Bold").text("Industry Supervisor Assessment");
    doc.moveDown(0.5);

    if (data.industryFinalComment) {
      doc.fontSize(12).font("Helvetica");
      doc.text(data.industryFinalComment.comment);
      doc.moveDown(0.5);

      if (data.industryFinalComment.rating) {
        doc.font("Helvetica-Bold").text("Rating: ", { continued: true });
        doc.font("Helvetica").text(data.industryFinalComment.rating);
      }

      doc
        .fontSize(10)
        .font("Helvetica-Oblique")
        .text(
          `Assessed by: ${data.industryFinalComment.industrySupervisor.name}${
            data.industryFinalComment.industrySupervisor.position
              ? ` (${data.industryFinalComment.industrySupervisor.position})`
              : ""
          }`,
        );
      doc.text(
        `Date: ${new Date(data.industryFinalComment.commentedAt).toLocaleDateString()}`,
      );
    } else {
      doc.fontSize(12).font("Helvetica-Oblique").text("No assessment provided");
    }

    doc.moveDown(2);

    // School Supervisor Final Comment
    doc.fontSize(14).font("Helvetica-Bold").text("School Supervisor Assessment");
    doc.moveDown(0.5);

    if (data.schoolFinalComment) {
      doc.fontSize(12).font("Helvetica");
      doc.text(data.schoolFinalComment.comment);
      doc.moveDown(0.5);

      if (data.schoolFinalComment.rating) {
        doc.font("Helvetica-Bold").text("Rating: ", { continued: true });
        doc.font("Helvetica").text(data.schoolFinalComment.rating);
      }

      doc
        .fontSize(10)
        .font("Helvetica-Oblique")
        .text(
          `Assessed by: ${data.schoolFinalComment.schoolSupervisor.name} (${data.schoolFinalComment.schoolSupervisor.staffId})`,
        );
      doc.text(
        `Date: ${new Date(data.schoolFinalComment.commentedAt).toLocaleDateString()}`,
      );
    } else {
      doc.fontSize(12).font("Helvetica-Oblique").text("No assessment provided");
    }
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
            schoolSupervisor: true,
          },
        },
        industrySupervisorWeeklyComments: {
          include: {
            industrySupervisor: true,
          },
        },
      },
    });
    
    if (!weeklyEntry) {
      throw new Error("Weekly entry not found");
    }

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: "A4",
          margins: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50,
          },
        });

        const chunks: Buffer[] = [];
        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        // Generate week preview content
        doc.fontSize(16).font("Helvetica-Bold").text(`WEEK ${weeklyEntry.weekNumber} - Preview`, {
          underline: true,
        });
        doc.moveDown(1);

        // Student info
        doc.fontSize(12).font("Helvetica-Bold").text("Student: ", { continued: true });
        doc.font("Helvetica").text(`${weeklyEntry.student.name} (${weeklyEntry.student.matricNumber})`);
        doc.moveDown(1);

        // Daily entries
        const days = [
          ["Monday", weeklyEntry.mondayEntry],
          ["Tuesday", weeklyEntry.tuesdayEntry],
          ["Wednesday", weeklyEntry.wednesdayEntry],
          ["Thursday", weeklyEntry.thursdayEntry],
          ["Friday", weeklyEntry.fridayEntry],
          ["Saturday", weeklyEntry.saturdayEntry],
        ];

        for (const [day, content] of days) {
          doc.font("Helvetica-Bold").text(`${day}:`, { continued: false });
          if (content) {
            doc.font("Helvetica").text(content, { indent: 20 });
          } else {
            doc.font("Helvetica-Oblique").text("No entry recorded", { indent: 20 });
          }
          doc.moveDown(0.5);
        }

        doc.moveDown(1);

        // Diagrams
        if (weeklyEntry.diagrams && weeklyEntry.diagrams.length > 0) {
          doc.font("Helvetica-Bold").text("Diagrams/Illustrations:");
          for (const diagram of weeklyEntry.diagrams) {
            doc.font("Helvetica").text(`- ${diagram.fileName}`, { indent: 20 });
            if (diagram.caption) {
              doc.font("Helvetica-Oblique").text(`  Caption: ${diagram.caption}`, { indent: 30 });
            }
          }
          doc.moveDown(1);
        }

        // Comments
        if (weeklyEntry.industrySupervisorWeeklyComments && weeklyEntry.industrySupervisorWeeklyComments.length > 0) {
          doc.font("Helvetica-Bold").text("Industry Supervisor Comments:");
          for (const comment of weeklyEntry.industrySupervisorWeeklyComments) {
            doc.font("Helvetica").text(comment.comment, { indent: 20 });
            doc.fontSize(10).font("Helvetica-Oblique")
              .text(`- ${comment.industrySupervisor.name} (${new Date(comment.commentedAt).toLocaleDateString()})`, { indent: 20 });
            doc.fontSize(12);
          }
          doc.moveDown(1);
        }

        if (weeklyEntry.schoolSupervisorWeeklyComments && weeklyEntry.schoolSupervisorWeeklyComments.length > 0) {
          doc.font("Helvetica-Bold").text("School Supervisor Comments:");
          for (const comment of weeklyEntry.schoolSupervisorWeeklyComments) {
            doc.font("Helvetica").text(comment.comment, { indent: 20 });
            doc.fontSize(10).font("Helvetica-Oblique")
              .text(`- ${comment.schoolSupervisor.name} (${new Date(comment.commentedAt).toLocaleDateString()})`, { indent: 20 });
            doc.fontSize(12);
          }
        }

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
   * 
   * Note: This is a pass-through method for MVP. Custom branding options
   * are defined in the API interface but not yet implemented.
   * Future versions will support:
   * - Cover page inclusion control
   * - Signature field addition
   * - Custom watermarks
   * - Institution logo integration
   */
  async generateCustomLogbookPdf(
    studentId: string,
    sessionId: string,
    _options: {
      includeCoverPage?: boolean;
      includeSignatures?: boolean;
      watermark?: string;
      institutionLogo?: string;
    },
  ): Promise<Buffer> {
    // MVP: Return standard PDF generation
    // Custom options will be implemented in a future release
    return this.generateLogbookPdf(studentId, sessionId);
  }
}

export const pdfGeneratorService = new PdfGeneratorService();
