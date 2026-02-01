import { db } from "@/lib/db";
import { getLogger } from "@/lib/logger";
import * as XLSX from "xlsx";
import { studentService } from "./student";
import { supervisorService } from "./supervisor";

const logger = getLogger(["services", "bulk-upload"]);

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
  errors: Array<{ row: number; error: string; data?: any }>;
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
  private parseExcelFile(buffer: Buffer, sheetName?: string): any[] {
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
    row: any,
    rowIndex: number,
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(row.email)) {
      return {
        valid: false,
        error: "Invalid email format",
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
        level: String(row.level).trim(),
        sessionId: row.sessionId ? String(row.sessionId).trim() : undefined,
      },
    };
  }

  /**
   * Validate supervisor row data
   */
  private validateSupervisorRow(
    row: any,
    rowIndex: number,
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(row.email)) {
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

      for (let i = 0; i < rows.length; i++) {
        const rowIndex = i + 2; // +2 because Excel rows start at 1 and header is row 1
        const row = rows[i];

        try {
          const validation = this.validateStudentRow(row, rowIndex);

          if (!validation.valid) {
            result.failedCount++;
            result.errors.push({
              row: rowIndex,
              error: validation.error || "Invalid row data",
              data: row,
            });
            continue;
          }

          const studentData = validation.data!;

          // Check if user already exists
          const existingUser = await db.user.findFirst({
            where: {
              OR: [
                { email: studentData.email },
                {
                  student: {
                    matricNumber: studentData.matricNumber,
                  },
                },
              ],
            },
          });

          if (existingUser) {
            result.failedCount++;
            result.errors.push({
              row: rowIndex,
              error: "User with this email or matric number already exists",
              data: studentData,
            });
            continue;
          }

          // Create student
          await studentService.createStudent({
            matricNumber: studentData.matricNumber,
            firstName: studentData.firstName,
            lastName: studentData.lastName,
            email: studentData.email,
            department: studentData.department,
            level: parseInt(studentData.level),
            sessionId: studentData.sessionId,
          });

          result.successCount++;
        } catch (error) {
          result.failedCount++;
          result.errors.push({
            row: rowIndex,
            error: error instanceof Error ? error.message : "Unknown error",
            data: row,
          });
          logger.error("Failed to create student", { row: rowIndex, error });
        }
      }

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

      for (let i = 0; i < rows.length; i++) {
        const rowIndex = i + 2;
        const row = rows[i];

        try {
          const validation = this.validateSupervisorRow(row, rowIndex);

          if (!validation.valid) {
            result.failedCount++;
            result.errors.push({
              row: rowIndex,
              error: validation.error || "Invalid row data",
              data: row,
            });
            continue;
          }

          const supervisorData = validation.data!;

          // Check if user already exists
          const existingUser = await db.user.findFirst({
            where: {
              OR: [
                { email: supervisorData.email },
                {
                  schoolSupervisor: {
                    staffId: supervisorData.staffId,
                  },
                },
              ],
            },
          });

          if (existingUser) {
            result.failedCount++;
            result.errors.push({
              row: rowIndex,
              error: "User with this email or staff ID already exists",
              data: supervisorData,
            });
            continue;
          }

          // Create supervisor
          await supervisorService.createSchoolSupervisor({
            staffId: supervisorData.staffId,
            firstName: supervisorData.firstName,
            lastName: supervisorData.lastName,
            email: supervisorData.email,
            department: supervisorData.department,
            phoneNumber: supervisorData.phoneNumber,
          });

          result.successCount++;
        } catch (error) {
          result.failedCount++;
          result.errors.push({
            row: rowIndex,
            error: error instanceof Error ? error.message : "Unknown error",
            data: row,
          });
          logger.error("Failed to create supervisor", { row: rowIndex, error });
        }
      }

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
