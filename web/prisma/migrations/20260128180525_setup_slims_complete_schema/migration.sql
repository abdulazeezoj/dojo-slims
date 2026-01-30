-- CreateEnum
CREATE TYPE "user_type" AS ENUM ('ADMIN', 'STUDENT', 'SCHOOL_SUPERVISOR', 'INDUSTRY_SUPERVISOR');

-- CreateEnum
CREATE TYPE "session_status" AS ENUM ('ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "assignment_method" AS ENUM ('MANUAL', 'AUTOMATIC');

-- CreateEnum
CREATE TYPE "locked_by" AS ENUM ('INDUSTRY_SUPERVISOR', 'SCHOOL_SUPERVISOR', 'MANUAL');

-- CreateEnum
CREATE TYPE "commenter_type" AS ENUM ('INDUSTRY_SUPERVISOR', 'SCHOOL_SUPERVISOR');

-- CreateEnum
CREATE TYPE "review_status" AS ENUM ('PENDING', 'REVIEWED', 'EXPIRED');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "userType" "user_type" NOT NULL,
    "userReferenceId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faculties" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faculties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "placement_organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "placement_organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "siwes_sessions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "totalWeeks" INTEGER NOT NULL DEFAULT 24,
    "status" "session_status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "siwes_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "betterAuthUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "matricNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "betterAuthUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_supervisors" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "betterAuthUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_supervisors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "industry_supervisors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "placementOrganizationId" TEXT NOT NULL,
    "position" TEXT,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "betterAuthUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "industry_supervisors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_session_enrollments" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "siwesSessionId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "enrolledAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_session_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supervisor_session_enrollments" (
    "id" TEXT NOT NULL,
    "schoolSupervisorId" TEXT NOT NULL,
    "siwesSessionId" TEXT NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supervisor_session_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_supervisor_assignments" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "schoolSupervisorId" TEXT NOT NULL,
    "siwesSessionId" TEXT NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "assignmentMethod" "assignment_method" NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_supervisor_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_siwes_details" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "siwesSessionId" TEXT NOT NULL,
    "placementOrganizationId" TEXT NOT NULL,
    "industrySupervisorId" TEXT NOT NULL,
    "trainingStartDate" TIMESTAMP(3) NOT NULL,
    "trainingEndDate" TIMESTAMP(3) NOT NULL,
    "jobTitle" TEXT,
    "departmentAtOrg" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_siwes_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logbook_metadata" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "siwesSessionId" TEXT NOT NULL,
    "programOfStudy" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "session" TEXT NOT NULL,
    "trainingDuration" TEXT NOT NULL,
    "areaOfSpecialization" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "logbook_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_entries" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "siwesSessionId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "mondayEntry" TEXT,
    "tuesdayEntry" TEXT,
    "wednesdayEntry" TEXT,
    "thursdayEntry" TEXT,
    "fridayEntry" TEXT,
    "saturdayEntry" TEXT,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "lockedBy" "locked_by",
    "lockedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weekly_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagrams" (
    "id" TEXT NOT NULL,
    "weeklyEntryId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "caption" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diagrams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_comments" (
    "id" TEXT NOT NULL,
    "weeklyEntryId" TEXT NOT NULL,
    "commenterType" "commenter_type" NOT NULL,
    "commenterId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "commentedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weekly_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_requests" (
    "id" TEXT NOT NULL,
    "weeklyEntryId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "industrySupervisorId" TEXT NOT NULL,
    "status" "review_status" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "final_comments" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "siwesSessionId" TEXT NOT NULL,
    "commenterType" "commenter_type" NOT NULL,
    "commenterId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "rating" TEXT,
    "commentedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "final_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "userType" "user_type" NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_userType_userReferenceId_idx" ON "user"("userType", "userReferenceId");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_userType_userReferenceId_key" ON "user"("userType", "userReferenceId");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "session_expiresAt_idx" ON "session"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE INDEX "verification_expiresAt_idx" ON "verification"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "faculties_name_key" ON "faculties"("name");

-- CreateIndex
CREATE UNIQUE INDEX "faculties_code_key" ON "faculties"("code");

-- CreateIndex
CREATE INDEX "faculties_code_idx" ON "faculties"("code");

-- CreateIndex
CREATE INDEX "faculties_name_idx" ON "faculties"("name");

-- CreateIndex
CREATE INDEX "departments_facultyId_idx" ON "departments"("facultyId");

-- CreateIndex
CREATE INDEX "departments_code_idx" ON "departments"("code");

-- CreateIndex
CREATE UNIQUE INDEX "departments_facultyId_code_key" ON "departments"("facultyId", "code");

-- CreateIndex
CREATE INDEX "placement_organizations_name_idx" ON "placement_organizations"("name");

-- CreateIndex
CREATE INDEX "siwes_sessions_status_idx" ON "siwes_sessions"("status");

-- CreateIndex
CREATE INDEX "siwes_sessions_startDate_endDate_idx" ON "siwes_sessions"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_adminId_key" ON "admin_users"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE INDEX "admin_users_adminId_idx" ON "admin_users"("adminId");

-- CreateIndex
CREATE INDEX "admin_users_email_idx" ON "admin_users"("email");

-- CreateIndex
CREATE INDEX "admin_users_betterAuthUserId_idx" ON "admin_users"("betterAuthUserId");

-- CreateIndex
CREATE UNIQUE INDEX "students_matricNumber_key" ON "students"("matricNumber");

-- CreateIndex
CREATE INDEX "students_matricNumber_idx" ON "students"("matricNumber");

-- CreateIndex
CREATE INDEX "students_departmentId_idx" ON "students"("departmentId");

-- CreateIndex
CREATE INDEX "students_email_idx" ON "students"("email");

-- CreateIndex
CREATE INDEX "students_betterAuthUserId_idx" ON "students"("betterAuthUserId");

-- CreateIndex
CREATE UNIQUE INDEX "school_supervisors_staffId_key" ON "school_supervisors"("staffId");

-- CreateIndex
CREATE UNIQUE INDEX "school_supervisors_email_key" ON "school_supervisors"("email");

-- CreateIndex
CREATE INDEX "school_supervisors_staffId_idx" ON "school_supervisors"("staffId");

-- CreateIndex
CREATE INDEX "school_supervisors_departmentId_idx" ON "school_supervisors"("departmentId");

-- CreateIndex
CREATE INDEX "school_supervisors_email_idx" ON "school_supervisors"("email");

-- CreateIndex
CREATE INDEX "school_supervisors_betterAuthUserId_idx" ON "school_supervisors"("betterAuthUserId");

-- CreateIndex
CREATE UNIQUE INDEX "industry_supervisors_email_key" ON "industry_supervisors"("email");

-- CreateIndex
CREATE INDEX "industry_supervisors_email_idx" ON "industry_supervisors"("email");

-- CreateIndex
CREATE INDEX "industry_supervisors_placementOrganizationId_idx" ON "industry_supervisors"("placementOrganizationId");

-- CreateIndex
CREATE INDEX "industry_supervisors_betterAuthUserId_idx" ON "industry_supervisors"("betterAuthUserId");

-- CreateIndex
CREATE INDEX "student_session_enrollments_studentId_siwesSessionId_idx" ON "student_session_enrollments"("studentId", "siwesSessionId");

-- CreateIndex
CREATE INDEX "student_session_enrollments_siwesSessionId_idx" ON "student_session_enrollments"("siwesSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "student_session_enrollments_studentId_siwesSessionId_key" ON "student_session_enrollments"("studentId", "siwesSessionId");

-- CreateIndex
CREATE INDEX "supervisor_session_enrollments_schoolSupervisorId_siwesSess_idx" ON "supervisor_session_enrollments"("schoolSupervisorId", "siwesSessionId");

-- CreateIndex
CREATE INDEX "supervisor_session_enrollments_siwesSessionId_idx" ON "supervisor_session_enrollments"("siwesSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "supervisor_session_enrollments_schoolSupervisorId_siwesSess_key" ON "supervisor_session_enrollments"("schoolSupervisorId", "siwesSessionId");

-- CreateIndex
CREATE INDEX "student_supervisor_assignments_studentId_siwesSessionId_idx" ON "student_supervisor_assignments"("studentId", "siwesSessionId");

-- CreateIndex
CREATE INDEX "student_supervisor_assignments_schoolSupervisorId_siwesSess_idx" ON "student_supervisor_assignments"("schoolSupervisorId", "siwesSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "student_supervisor_assignments_studentId_schoolSupervisorId_key" ON "student_supervisor_assignments"("studentId", "schoolSupervisorId", "siwesSessionId");

-- CreateIndex
CREATE INDEX "student_siwes_details_studentId_siwesSessionId_idx" ON "student_siwes_details"("studentId", "siwesSessionId");

-- CreateIndex
CREATE INDEX "student_siwes_details_industrySupervisorId_idx" ON "student_siwes_details"("industrySupervisorId");

-- CreateIndex
CREATE INDEX "student_siwes_details_placementOrganizationId_idx" ON "student_siwes_details"("placementOrganizationId");

-- CreateIndex
CREATE UNIQUE INDEX "student_siwes_details_studentId_siwesSessionId_key" ON "student_siwes_details"("studentId", "siwesSessionId");

-- CreateIndex
CREATE INDEX "logbook_metadata_studentId_siwesSessionId_idx" ON "logbook_metadata"("studentId", "siwesSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "logbook_metadata_studentId_siwesSessionId_key" ON "logbook_metadata"("studentId", "siwesSessionId");

-- CreateIndex
CREATE INDEX "weekly_entries_studentId_siwesSessionId_weekNumber_idx" ON "weekly_entries"("studentId", "siwesSessionId", "weekNumber");

-- CreateIndex
CREATE INDEX "weekly_entries_studentId_isLocked_idx" ON "weekly_entries"("studentId", "isLocked");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_entries_studentId_siwesSessionId_weekNumber_key" ON "weekly_entries"("studentId", "siwesSessionId", "weekNumber");

-- CreateIndex
CREATE INDEX "diagrams_weeklyEntryId_idx" ON "diagrams"("weeklyEntryId");

-- CreateIndex
CREATE INDEX "weekly_comments_weeklyEntryId_commenterType_idx" ON "weekly_comments"("weeklyEntryId", "commenterType");

-- CreateIndex
CREATE INDEX "weekly_comments_commenterId_commenterType_idx" ON "weekly_comments"("commenterId", "commenterType");

-- CreateIndex
CREATE UNIQUE INDEX "review_requests_weeklyEntryId_key" ON "review_requests"("weeklyEntryId");

-- CreateIndex
CREATE INDEX "review_requests_weeklyEntryId_idx" ON "review_requests"("weeklyEntryId");

-- CreateIndex
CREATE INDEX "review_requests_industrySupervisorId_status_idx" ON "review_requests"("industrySupervisorId", "status");

-- CreateIndex
CREATE INDEX "review_requests_studentId_idx" ON "review_requests"("studentId");

-- CreateIndex
CREATE INDEX "final_comments_studentId_siwesSessionId_commenterType_idx" ON "final_comments"("studentId", "siwesSessionId", "commenterType");

-- CreateIndex
CREATE INDEX "final_comments_commenterId_commenterType_idx" ON "final_comments"("commenterId", "commenterType");

-- CreateIndex
CREATE UNIQUE INDEX "final_comments_studentId_siwesSessionId_commenterType_key" ON "final_comments"("studentId", "siwesSessionId", "commenterType");

-- CreateIndex
CREATE INDEX "activity_logs_userType_userId_idx" ON "activity_logs"("userType", "userId");

-- CreateIndex
CREATE INDEX "activity_logs_entityType_entityId_idx" ON "activity_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "activity_logs_createdAt_idx" ON "activity_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "faculties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_supervisors" ADD CONSTRAINT "school_supervisors_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "industry_supervisors" ADD CONSTRAINT "industry_supervisors_placementOrganizationId_fkey" FOREIGN KEY ("placementOrganizationId") REFERENCES "placement_organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_session_enrollments" ADD CONSTRAINT "student_session_enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_session_enrollments" ADD CONSTRAINT "student_session_enrollments_siwesSessionId_fkey" FOREIGN KEY ("siwesSessionId") REFERENCES "siwes_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supervisor_session_enrollments" ADD CONSTRAINT "supervisor_session_enrollments_schoolSupervisorId_fkey" FOREIGN KEY ("schoolSupervisorId") REFERENCES "school_supervisors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supervisor_session_enrollments" ADD CONSTRAINT "supervisor_session_enrollments_siwesSessionId_fkey" FOREIGN KEY ("siwesSessionId") REFERENCES "siwes_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_supervisor_assignments" ADD CONSTRAINT "student_supervisor_assignments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_supervisor_assignments" ADD CONSTRAINT "student_supervisor_assignments_schoolSupervisorId_fkey" FOREIGN KEY ("schoolSupervisorId") REFERENCES "school_supervisors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_supervisor_assignments" ADD CONSTRAINT "student_supervisor_assignments_siwesSessionId_fkey" FOREIGN KEY ("siwesSessionId") REFERENCES "siwes_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_supervisor_assignments" ADD CONSTRAINT "student_supervisor_assignments_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "admin_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_siwes_details" ADD CONSTRAINT "student_siwes_details_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_siwes_details" ADD CONSTRAINT "student_siwes_details_siwesSessionId_fkey" FOREIGN KEY ("siwesSessionId") REFERENCES "siwes_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_siwes_details" ADD CONSTRAINT "student_siwes_details_placementOrganizationId_fkey" FOREIGN KEY ("placementOrganizationId") REFERENCES "placement_organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_siwes_details" ADD CONSTRAINT "student_siwes_details_industrySupervisorId_fkey" FOREIGN KEY ("industrySupervisorId") REFERENCES "industry_supervisors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logbook_metadata" ADD CONSTRAINT "logbook_metadata_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logbook_metadata" ADD CONSTRAINT "logbook_metadata_siwesSessionId_fkey" FOREIGN KEY ("siwesSessionId") REFERENCES "siwes_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_entries" ADD CONSTRAINT "weekly_entries_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_entries" ADD CONSTRAINT "weekly_entries_siwesSessionId_fkey" FOREIGN KEY ("siwesSessionId") REFERENCES "siwes_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagrams" ADD CONSTRAINT "diagrams_weeklyEntryId_fkey" FOREIGN KEY ("weeklyEntryId") REFERENCES "weekly_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_comments" ADD CONSTRAINT "weekly_comments_weeklyEntryId_fkey" FOREIGN KEY ("weeklyEntryId") REFERENCES "weekly_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_requests" ADD CONSTRAINT "review_requests_weeklyEntryId_fkey" FOREIGN KEY ("weeklyEntryId") REFERENCES "weekly_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_requests" ADD CONSTRAINT "review_requests_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_requests" ADD CONSTRAINT "review_requests_industrySupervisorId_fkey" FOREIGN KEY ("industrySupervisorId") REFERENCES "industry_supervisors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "final_comments" ADD CONSTRAINT "final_comments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "final_comments" ADD CONSTRAINT "final_comments_siwesSessionId_fkey" FOREIGN KEY ("siwesSessionId") REFERENCES "siwes_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
