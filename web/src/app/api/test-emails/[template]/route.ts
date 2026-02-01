import { readFile } from "fs/promises";
import { NextResponse, type NextRequest } from "next/server";
import { join } from "path";


import { getLogger } from "@/lib/logger";

const logger = getLogger(["api", "test-emails"]);

// Sample data for testing email templates
const sampleData: Record<string, Record<string, string>> = {
  "magic-link": {
    recipientName: "Aisha Mohammed",
    magicLink: "https://slims.abu.edu.ng/auth/magic-link/verify?token=abc123",
    magicLinkToken: "ABC-123-XYZ-789",
    expiryMinutes: "15",
  },
  "welcome-account": {
    recipientName: "Ibrahim Yusuf",
    userType: "Student",
    loginCredential: "U19/SCI/CS/1234",
    loginUrl: "https://slims.abu.edu.ng/auth/login/student",
    supportEmail: "support@slims.abu.edu.ng",
  },
  "password-reset": {
    recipientName: "Fatima Hassan",
    resetLink: "https://slims.abu.edu.ng/auth/reset-password?token=xyz789",
    expiryMinutes: "30",
  },
  "password-changed": {
    recipientName: "Ahmed Musa",
    changeTime: new Date().toLocaleString("en-US", {
      dateStyle: "full",
      timeStyle: "short",
    }),
    ipAddress: "197.210.226.105",
    deviceInfo: "Chrome on Windows 10",
  },
  "session-enrollment-student": {
    studentName: "Zainab Abdullahi",
    sessionName: "2025/2026 SIWES Session",
    startDate: "March 1, 2026",
    endDate: "August 31, 2026",
    totalWeeks: "24",
    dashboardUrl: "https://slims.abu.edu.ng/student/dashboard",
  },
  "session-enrollment-supervisor": {
    supervisorName: "Dr. Usman Bello",
    sessionName: "2025/2026 SIWES Session",
    startDate: "March 1, 2026",
    endDate: "August 31, 2026",
    assignedStudentsCount: "12",
    dashboardUrl: "https://slims.abu.edu.ng/school-supervisor/dashboard",
  },
  "student-supervisor-assigned": {
    studentName: "Aisha Mohammed",
    supervisorName: "Dr. Usman Bello",
    supervisorEmail: "u.bello@abu.edu.ng",
    sessionName: "2025/2026 SIWES Session",
    dashboardUrl: "https://slims.abu.edu.ng/student/dashboard",
  },
  "school-supervisor-assigned": {
    supervisorName: "Dr. Usman Bello",
    studentCount: "3",
    sessionName: "2025/2026 SIWES Session",
    studentNames:
      "<p>1. Aisha Mohammed (U19/SCI/CS/1234)</p><p>2. Ibrahim Yusuf (U19/SCI/CS/5678)</p><p>3. Zainab Abdullahi (U19/SCI/CS/9012)</p>",
    dashboardUrl: "https://slims.abu.edu.ng/school-supervisor/dashboard",
  },
  "industry-supervisor-linked": {
    supervisorName: "Engr. Chukwuma Okafor",
    studentName: "Aisha Mohammed",
    studentEmail: "aisha.mohammed@student.abu.edu.ng",
    sessionName: "2025/2026 SIWES Session",
    trainingDates: "March 1, 2026 - August 31, 2026",
    dashboardUrl: "https://slims.abu.edu.ng/industry-supervisor/dashboard",
  },
  "review-request-industry": {
    supervisorName: "Engr. Chukwuma Okafor",
    studentName: "Aisha Mohammed",
    weekNumber: "5",
    weekDate: "April 1-6, 2026",
    reviewUrl: "https://slims.abu.edu.ng/industry-supervisor/review/week/5",
    expiryNote:
      "Student feedback helps improve the quality of their learning experience.",
  },
  "review-request-final-industry": {
    supervisorName: "Engr. Chukwuma Okafor",
    studentName: "Aisha Mohammed",
    totalWeeks: "24",
    sessionName: "2025/2026 SIWES Session",
    reviewUrl: "https://slims.abu.edu.ng/industry-supervisor/review/final",
  },
  "review-request-final-school": {
    supervisorName: "Dr. Usman Bello",
    studentName: "Aisha Mohammed",
    totalWeeks: "24",
    sessionName: "2025/2026 SIWES Session",
    reviewUrl: "https://slims.abu.edu.ng/school-supervisor/review/final",
  },
  "comment-received-student": {
    studentName: "Aisha Mohammed",
    supervisorName: "Engr. Chukwuma Okafor",
    supervisorType: "Industry Supervisor",
    weekNumber: "5",
    commentSnippet:
      "Excellent work this week! Your implementation of the authentication module showed good understanding of security principles. Keep up the great work!",
    dashboardUrl: "https://slims.abu.edu.ng/student/logbook/week/5",
  },
  "week-locked-notification": {
    studentName: "Aisha Mohammed",
    weekNumber: "5",
    lockedBy: "Dr. Usman Bello (School Supervisor)",
    lockReason: "Review completed and approved",
    dashboardUrl: "https://slims.abu.edu.ng/student/logbook",
  },
};

const validTemplates = Object.keys(sampleData);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ template: string }> },
) {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Email template testing is only available in development" },
      { status: 403 },
    );
  }

  const { template } = await params;

  // Validate template name
  if (!validTemplates.includes(template)) {
    return NextResponse.json(
      {
        error: "Invalid template name",
        availableTemplates: validTemplates,
      },
      { status: 404 },
    );
  }

  try {
    // Read the HTML template file
    const templatePath = join(
      process.cwd(),
      "src",
      "templates",
      "emails",
      `${template}.html`,
    );
    let htmlContent = await readFile(templatePath, "utf-8");

    // Replace all template variables with sample data
    const data = sampleData[template];
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{${key}}}`, "g");
      htmlContent = htmlContent.replace(regex, value);
    }

    // Return HTML response
    return new NextResponse(htmlContent, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    logger.error("Failed to load email template", { error, template });
    return NextResponse.json(
      {
        error: "Failed to load email template",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
