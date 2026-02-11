/*
  Warnings:

  - You are about to drop the column `isActive` on the `student_session_enrollments` table. All the data in the column will be lost.
  - You are about to drop the `activity_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `final_comments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `review_requests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `weekly_comments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "final_comments" DROP CONSTRAINT "final_comments_siwesSessionId_fkey";

-- DropForeignKey
ALTER TABLE "final_comments" DROP CONSTRAINT "final_comments_studentId_fkey";

-- DropForeignKey
ALTER TABLE "review_requests" DROP CONSTRAINT "review_requests_industrySupervisorId_fkey";

-- DropForeignKey
ALTER TABLE "review_requests" DROP CONSTRAINT "review_requests_studentId_fkey";

-- DropForeignKey
ALTER TABLE "review_requests" DROP CONSTRAINT "review_requests_weeklyEntryId_fkey";

-- DropForeignKey
ALTER TABLE "weekly_comments" DROP CONSTRAINT "weekly_comments_weeklyEntryId_fkey";

-- DropIndex
DROP INDEX "student_session_enrollments_siwesSessionId_idx";

-- AlterTable
ALTER TABLE "student_session_enrollments" DROP COLUMN "isActive",
ALTER COLUMN "enrolledAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "supervisor_session_enrollments" ALTER COLUMN "enrolledAt" SET DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "activity_logs";

-- DropTable
DROP TABLE "final_comments";

-- DropTable
DROP TABLE "review_requests";

-- DropTable
DROP TABLE "weekly_comments";

-- DropEnum
DROP TYPE "commenter_type";

-- CreateTable
CREATE TABLE "school_supervisor_weekly_comments" (
    "id" TEXT NOT NULL,
    "weeklyEntryId" TEXT NOT NULL,
    "schoolSupervisorId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "commentedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_supervisor_weekly_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "industry_supervisor_weekly_comments" (
    "id" TEXT NOT NULL,
    "weeklyEntryId" TEXT NOT NULL,
    "industrySupervisorId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "commentedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "industry_supervisor_weekly_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "industry_supervisor_review_requests" (
    "id" TEXT NOT NULL,
    "weeklyEntryId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "industrySupervisorId" TEXT NOT NULL,
    "status" "review_status" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "industry_supervisor_review_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_supervisor_final_comments" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "siwesSessionId" TEXT NOT NULL,
    "schoolSupervisorId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "rating" TEXT,
    "commentedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_supervisor_final_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "industry_supervisor_final_comments" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "siwesSessionId" TEXT NOT NULL,
    "industrySupervisorId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "rating" TEXT,
    "commentedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "industry_supervisor_final_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "school_supervisor_weekly_comments_weeklyEntryId_idx" ON "school_supervisor_weekly_comments"("weeklyEntryId");

-- CreateIndex
CREATE INDEX "school_supervisor_weekly_comments_schoolSupervisorId_idx" ON "school_supervisor_weekly_comments"("schoolSupervisorId");

-- CreateIndex
CREATE INDEX "industry_supervisor_weekly_comments_weeklyEntryId_idx" ON "industry_supervisor_weekly_comments"("weeklyEntryId");

-- CreateIndex
CREATE INDEX "industry_supervisor_weekly_comments_industrySupervisorId_idx" ON "industry_supervisor_weekly_comments"("industrySupervisorId");

-- CreateIndex
CREATE UNIQUE INDEX "industry_supervisor_review_requests_weeklyEntryId_key" ON "industry_supervisor_review_requests"("weeklyEntryId");

-- CreateIndex
CREATE INDEX "industry_supervisor_review_requests_weeklyEntryId_idx" ON "industry_supervisor_review_requests"("weeklyEntryId");

-- CreateIndex
CREATE INDEX "industry_supervisor_review_requests_industrySupervisorId_st_idx" ON "industry_supervisor_review_requests"("industrySupervisorId", "status");

-- CreateIndex
CREATE INDEX "industry_supervisor_review_requests_studentId_idx" ON "industry_supervisor_review_requests"("studentId");

-- CreateIndex
CREATE INDEX "school_supervisor_final_comments_studentId_siwesSessionId_idx" ON "school_supervisor_final_comments"("studentId", "siwesSessionId");

-- CreateIndex
CREATE INDEX "school_supervisor_final_comments_schoolSupervisorId_idx" ON "school_supervisor_final_comments"("schoolSupervisorId");

-- CreateIndex
CREATE UNIQUE INDEX "school_supervisor_final_comments_studentId_siwesSessionId_s_key" ON "school_supervisor_final_comments"("studentId", "siwesSessionId", "schoolSupervisorId");

-- CreateIndex
CREATE INDEX "industry_supervisor_final_comments_studentId_siwesSessionId_idx" ON "industry_supervisor_final_comments"("studentId", "siwesSessionId");

-- CreateIndex
CREATE INDEX "industry_supervisor_final_comments_industrySupervisorId_idx" ON "industry_supervisor_final_comments"("industrySupervisorId");

-- CreateIndex
CREATE UNIQUE INDEX "industry_supervisor_final_comments_studentId_siwesSessionId_key" ON "industry_supervisor_final_comments"("studentId", "siwesSessionId", "industrySupervisorId");

-- AddForeignKey
ALTER TABLE "school_supervisor_weekly_comments" ADD CONSTRAINT "school_supervisor_weekly_comments_weeklyEntryId_fkey" FOREIGN KEY ("weeklyEntryId") REFERENCES "weekly_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_supervisor_weekly_comments" ADD CONSTRAINT "school_supervisor_weekly_comments_schoolSupervisorId_fkey" FOREIGN KEY ("schoolSupervisorId") REFERENCES "school_supervisors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "industry_supervisor_weekly_comments" ADD CONSTRAINT "industry_supervisor_weekly_comments_weeklyEntryId_fkey" FOREIGN KEY ("weeklyEntryId") REFERENCES "weekly_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "industry_supervisor_weekly_comments" ADD CONSTRAINT "industry_supervisor_weekly_comments_industrySupervisorId_fkey" FOREIGN KEY ("industrySupervisorId") REFERENCES "industry_supervisors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "industry_supervisor_review_requests" ADD CONSTRAINT "industry_supervisor_review_requests_industrySupervisorId_fkey" FOREIGN KEY ("industrySupervisorId") REFERENCES "industry_supervisors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "industry_supervisor_review_requests" ADD CONSTRAINT "industry_supervisor_review_requests_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "industry_supervisor_review_requests" ADD CONSTRAINT "industry_supervisor_review_requests_weeklyEntryId_fkey" FOREIGN KEY ("weeklyEntryId") REFERENCES "weekly_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_supervisor_final_comments" ADD CONSTRAINT "school_supervisor_final_comments_siwesSessionId_fkey" FOREIGN KEY ("siwesSessionId") REFERENCES "siwes_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_supervisor_final_comments" ADD CONSTRAINT "school_supervisor_final_comments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_supervisor_final_comments" ADD CONSTRAINT "school_supervisor_final_comments_schoolSupervisorId_fkey" FOREIGN KEY ("schoolSupervisorId") REFERENCES "school_supervisors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "industry_supervisor_final_comments" ADD CONSTRAINT "industry_supervisor_final_comments_siwesSessionId_fkey" FOREIGN KEY ("siwesSessionId") REFERENCES "siwes_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "industry_supervisor_final_comments" ADD CONSTRAINT "industry_supervisor_final_comments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "industry_supervisor_final_comments" ADD CONSTRAINT "industry_supervisor_final_comments_industrySupervisorId_fkey" FOREIGN KEY ("industrySupervisorId") REFERENCES "industry_supervisors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
