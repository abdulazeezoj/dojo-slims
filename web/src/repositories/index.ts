// ===== ADMIN =====
export { AdminUserRepository, adminUserRepository } from "./admin-user";

// ===== USER =====
export { UserRepository, userRepository } from "./user";

// ===== STUDENT =====
export { StudentRepository, studentRepository } from "./student";
export type { StudentDashboardData, StudentWithDetails } from "./student";

// ===== SCHOOL SUPERVISOR =====
export {
  SchoolSupervisorRepository,
  schoolSupervisorRepository,
} from "./school-supervisor";
export type {
  SchoolSupervisorDashboardData,
  SchoolSupervisorWithDetails,
} from "./school-supervisor";

// ===== INDUSTRY SUPERVISOR =====
export {
  IndustrySupervisorRepository,
  industrySupervisorRepository,
} from "./industry-supervisor";
export type {
  IndustrySupervisorDashboardData,
  IndustrySupervisorWithDetails,
} from "./industry-supervisor";

// ===== FACULTY & DEPARTMENT =====
export {
  DepartmentRepository,
  departmentRepository,
  FacultyRepository,
  facultyRepository,
} from "./faculty";

// ===== PLACEMENT ORGANIZATION =====
export {
  PlacementOrganizationRepository,
  placementOrganizationRepository,
} from "./placement-organization";

// ===== SIWES SESSION =====
export {
  SiwesSessionRepository,
  siwesSessionRepository,
} from "./siwes-session";

// ===== SESSION ENROLLMENTS =====
export {
  StudentSessionEnrollmentRepository,
  studentSessionEnrollmentRepository,
} from "./student-session-enrollment";

export {
  SupervisorSessionEnrollmentRepository,
  supervisorSessionEnrollmentRepository,
} from "./supervisor-session-enrollment";

// ===== STUDENT SUPERVISOR ASSIGNMENT =====
export {
  StudentSupervisorAssignmentRepository,
  studentSupervisorAssignmentRepository,
} from "./student-supervisor-assignment";

// ===== STUDENT SIWES DETAILS =====
export {
  StudentSiwesDetailRepository,
  studentSiwesDetailRepository,
} from "./student-siwes-detail";

// ===== LOGBOOK METADATA =====
export {
  LogbookMetadataRepository,
  logbookMetadataRepository,
} from "./logbook-metadata";

// ===== WEEKLY ENTRY =====
export { WeeklyEntryRepository, weeklyEntryRepository } from "./weekly-entry";
export type { WeeklyEntryWithRelations } from "./weekly-entry";

// ===== DIAGRAMS =====
export { DiagramRepository, diagramRepository } from "./diagram";

// ===== WEEKLY COMMENTS (Separate tables for each supervisor type) =====
export {
  IndustrySupervisorWeeklyCommentRepository,
  industrySupervisorWeeklyCommentRepository,
  SchoolSupervisorWeeklyCommentRepository,
  schoolSupervisorWeeklyCommentRepository,
} from "./weekly-comment";

// ===== FINAL COMMENTS (Separate tables for each supervisor type) =====
export {
  IndustrySupervisorFinalCommentRepository,
  industrySupervisorFinalCommentRepository,
  SchoolSupervisorFinalCommentRepository,
  schoolSupervisorFinalCommentRepository,
} from "./final-comment";

// ===== REVIEW REQUEST (Industry Supervisor) =====
export {
  IndustrySupervisorReviewRequestRepository,
  industrySupervisorReviewRequestRepository,
} from "./review-request";

// ===== ACTIVITY LOG =====
export {
  ActivityLogRepository,
  activityLogRepository,
} from "./activity-log";
