import * as XLSX from "xlsx";

import { getLogger } from "@/lib/logger";
import prisma from "@/lib/prisma";

import { bulkUserCreationService } from "./bulk-user-creation";

const logger = getLogger(["services", "bulk-upload"]);

/**
 * Validate email format with improved regex
 * Requires: valid local part, @ symbol, domain with at least 2 chars, dot, TLD with 2+ chars
 */
function isValidEmail(email: unknown): boolean {
  if (typeof email !== "string") {
    return false;
  }

  // More comprehensive email validation
  // - Local part: alphanumeric, dots, hyphens, underscores (but not at start/end)
  // - Domain: alphanumeric with hyphens (at least 2 chars)
  // - TLD: at least 2 alphabetic characters
  const emailRegex =
    /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

  return emailRegex.test(email);
}

interface StudentRow {
  matricNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  level: string;
  sessionId?: string;
}

interface SupervisorRow {
  staffId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  phoneNumber?: string;
}

interface BulkUploadResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  failedCount: number;
  errors: Array<{ row: number; error: string; data?: unknown }>;
}

export class BulkUploadService {
  /**
   * Generate Excel template for student bulk upload
   */
  generateStudentTemplate(): Buffer {
    const worksheet = XLSX.utils.aoa_to_sheet([
      [
        "matricNumber",
        "firstName",
        "lastName",
        "email",
        "department",
        "level",
        "sessionId (optional)",
      ],
      [
        "CS/2020/001",
        "John",
        "Doe",
        "john.doe@example.com",
        "Computer Science",
        "400",
        "",
      ],
      [
        "CS/2020/002",
        "Jane",
        "Smith",
        "jane.smith@example.com",
        "Computer Science",
        "400",
        "",
      ],
    ]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

    return Buffer.from(
      XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }),
    );
  }

  /**
   * Generate Excel template for school supervisor bulk upload
   */
  generateSupervisorTemplate(): Buffer {
    const worksheet = XLSX.utils.aoa_to_sheet([
      [
        "staffId",
        "firstName",
        "lastName",
        "email",
        "department",
        "phoneNumber (optional)",
      ],
      [
        "STAFF001",
        "Dr. John",
        "Doe",
        "john.doe@university.edu",
        "Computer Science",
        "+2348012345678",
      ],
      [
        "STAFF002",
        "Prof. Jane",
        "Smith",
        "jane.smith@university.edu",
        "Engineering",
        "+2348087654321",
      ],
    ]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Supervisors");

    return Buffer.from(
      XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }),
    );
  }

  /**
   * Parse Excel file to JSON
   */
  private parseExcelFile(
    buffer: Buffer,
    sheetName?: string,
  ): Record<string, unknown>[] {
    // Validate file type by checking magic numbers (file signature)
    // Excel files (.xlsx) start with "PK" (ZIP file format)
    // Excel 97-2003 files (.xls) start with specific signature
    if (buffer.length < 4) {
      throw new Error("Invalid file: File is too small to be an Excel file");
    }

    const header = buffer.toString("hex", 0, 4);
    const isPKZip = buffer.toString("ascii", 0, 2) === "PK"; // XLSX files
    const isXls = header === "d0cf11e0"; // XLS files (OLE2 format)

    if (!isPKZip && !isXls) {
      throw new Error(
        "Invalid file type: Only Excel files (.xlsx, .xls) are supported",
      );
    }

    // Additional size validation (max 10MB for bulk uploads)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (buffer.length > maxSize) {
      throw new Error(
        `File too large: Maximum file size is ${maxSize / 1024 / 1024}MB`,
      );
    }

    try {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheet = sheetName
        ? workbook.Sheets[sheetName]
        : workbook.Sheets[workbook.SheetNames[0]];

      if (!sheet) {
        throw new Error(`Sheet ${sheetName || "default"} not found`);
      }

      return XLSX.utils.sheet_to_json(sheet);
    } catch (error) {
      logger.error("Failed to parse Excel file", { error });
      throw new Error("Invalid Excel file format");
    }
  }

  /**
   * Validate student row data
   */
  private validateStudentRow(
    row: Record<string, unknown>,
    _rowIndex: number,
  ): {
    valid: boolean;
    error?: string;
    data?: StudentRow;
  } {
    const requiredFields = [
      "matricNumber",
      "firstName",
      "lastName",
      "email",
      "department",
      "level",
    ];

    for (const field of requiredFields) {
      if (!row[field] || String(row[field]).trim() === "") {
        return {
          valid: false,
          error: `Missing required field: ${field}`,
        };
      }
    }

    // Email validation
    if (!isValidEmail(row.email)) {
      return {
        valid: false,
        error: "Invalid email format",
      };
    }

    // Level validation
    const levelStr = String(row.level).trim();
    const levelNum = parseInt(levelStr, 10);
    const validLevels = [100, 200, 300, 400];

    if (isNaN(levelNum) || !validLevels.includes(levelNum)) {
      return {
        valid: false,
        error: `Invalid level: Must be one of ${validLevels.join(", ")}`,
      };
    }

    return {
      valid: true,
      data: {
        matricNumber: String(row.matricNumber).trim(),
        firstName: String(row.firstName).trim(),
        lastName: String(row.lastName).trim(),
        email: String(row.email).trim().toLowerCase(),
        department: String(row.department).trim(),
        level: levelStr,
        sessionId: row.sessionId ? String(row.sessionId).trim() : undefined,
      },
    };
  }

  /**
   * Validate supervisor row data
   */
  private validateSupervisorRow(
    row: Record<string, unknown>,
    _rowIndex: number,
  ): {
    valid: boolean;
    error?: string;
    data?: SupervisorRow;
  } {
    const requiredFields = [
      "staffId",
      "firstName",
      "lastName",
      "email",
      "department",
    ];

    for (const field of requiredFields) {
      if (!row[field] || String(row[field]).trim() === "") {
        return {
          valid: false,
          error: `Missing required field: ${field}`,
        };
      }
    }

    // Email validation
    if (!isValidEmail(row.email)) {
      return {
        valid: false,
        error: "Invalid email format",
      };
    }

    return {
      valid: true,
      data: {
        staffId: String(row.staffId).trim(),
        firstName: String(row.firstName).trim(),
        lastName: String(row.lastName).trim(),
        email: String(row.email).trim().toLowerCase(),
        department: String(row.department).trim(),
        phoneNumber: row.phoneNumber
          ? String(row.phoneNumber).trim()
          : undefined,
      },
    };
  }

  /**
   * Bulk upload students from Excel file
   */
  async uploadStudents(fileBuffer: Buffer): Promise<BulkUploadResult> {
    const result: BulkUploadResult = {
      success: false,
      totalRows: 0,
      successCount: 0,
      failedCount: 0,
      errors: [],
    };

    try {
      const rows = this.parseExcelFile(fileBuffer, "Students");
      result.totalRows = rows.length;

      logger.info("Processing student bulk upload", { totalRows: rows.length });

      // Prepare batch data for bulk creation
      const validStudents: Array<{
        name: string;
        email: string;
        matricNumber: string;
        departmentId: string;
      }> = [];
      const validationErrors: Array<{
        row: number;
        error: string;
        data?: unknown;
      }> = [];

      for (let i = 0; i < rows.length; i++) {
        const rowIndex = i + 2; // +2 because Excel rows start at 1 and header is row 1
        const row = rows[i];

        const validation = this.validateStudentRow(row, rowIndex);

        if (!validation.valid) {
          validationErrors.push({
            row: rowIndex,
            error: validation.error || "Invalid row data",
            data: row,
          });
          continue;
        }

        const studentData = validation.data!;

        // Find department by name
        const department = await prisma.department.findFirst({
          where: { name: studentData.department },
        });

        if (!department) {
          validationErrors.push({
            row: rowIndex,
            error: `Department "${studentData.department}" not found`,
            data: studentData,
          });
          continue;
        }

        // Concatenate firstName and lastName into single name field
        const fullName =
          `${studentData.firstName} ${studentData.lastName}`.trim();

        validStudents.push({
          name: fullName,
          email: studentData.email,
          matricNumber: studentData.matricNumber,
          departmentId: department.id,
        });
      }

      // Bulk create valid students using bulk-user-creation service
      const bulkResult =
        await bulkUserCreationService.bulkCreateStudents(validStudents);

      result.successCount = bulkResult.success.length;
      result.failedCount = validationErrors.length + bulkResult.failures.length;

      // Combine validation errors with creation failures
      result.errors = [
        ...validationErrors,
        ...bulkResult.failures.map((failure) => ({
          row: -1, // Row number unknown for creation failures
          error: failure.error,
          data: failure.data,
        })),
      ];

      result.success = result.successCount > 0;
      logger.info("Student bulk upload completed", {
        total: result.totalRows,
        success: result.successCount,
        failed: result.failedCount,
      });

      return result;
    } catch (error) {
      logger.error("Student bulk upload failed", { error });
      throw new Error(
        error instanceof Error ? error.message : "Bulk upload failed",
      );
    }
  }

  /**
   * Bulk upload school supervisors from Excel file
   */
  async uploadSupervisors(fileBuffer: Buffer): Promise<BulkUploadResult> {
    const result: BulkUploadResult = {
      success: false,
      totalRows: 0,
      successCount: 0,
      failedCount: 0,
      errors: [],
    };

    try {
      const rows = this.parseExcelFile(fileBuffer, "Supervisors");
      result.totalRows = rows.length;

      logger.info("Processing supervisor bulk upload", {
        totalRows: rows.length,
      });

      // Prepare batch data for bulk creation
      const validSupervisors: Array<{
        name: string;
        email: string;
        staffId: string;
        departmentId: string;
      }> = [];
      const validationErrors: Array<{
        row: number;
        error: string;
        data?: unknown;
      }> = [];

      for (let i = 0; i < rows.length; i++) {
        const rowIndex = i + 2;
        const row = rows[i];

        const validation = this.validateSupervisorRow(row, rowIndex);

        if (!validation.valid) {
          validationErrors.push({
            row: rowIndex,
            error: validation.error || "Invalid row data",
            data: row,
          });
          continue;
        }

        const supervisorData = validation.data!;

        // Find department by name
        const department = await prisma.department.findFirst({
          where: { name: supervisorData.department },
        });

        if (!department) {
          validationErrors.push({
            row: rowIndex,
            error: `Department "${supervisorData.department}" not found`,
            data: supervisorData,
          });
          continue;
        }

        // Concatenate firstName and lastName into single name field
        const fullName =
          `${supervisorData.firstName} ${supervisorData.lastName}`.trim();

        validSupervisors.push({
          name: fullName,
          email: supervisorData.email,
          staffId: supervisorData.staffId,
          departmentId: department.id,
        });
      }

      // Bulk create valid supervisors using bulk-user-creation service
      const bulkResult =
        await bulkUserCreationService.bulkCreateSchoolSupervisors(
          validSupervisors,
        );

      result.successCount = bulkResult.success.length;
      result.failedCount = validationErrors.length + bulkResult.failures.length;

      // Combine validation errors with creation failures
      result.errors = [
        ...validationErrors,
        ...bulkResult.failures.map((failure) => ({
          row: -1, // Row number unknown for creation failures
          error: failure.error,
          data: failure.data,
        })),
      ];

      result.success = result.successCount > 0;
      logger.info("Supervisor bulk upload completed", {
        total: result.totalRows,
        success: result.successCount,
        failed: result.failedCount,
      });

      return result;
    } catch (error) {
      logger.error("Supervisor bulk upload failed", { error });
      throw new Error(
        error instanceof Error ? error.message : "Bulk upload failed",
      );
    }
  }
}

export const bulkUploadService = new BulkUploadService();
