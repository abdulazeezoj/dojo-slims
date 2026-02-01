/*
  Warnings:

  - You are about to drop the column `passwordHash` on the `admin_users` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHash` on the `school_supervisors` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `student_session_enrollments` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHash` on the `students` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[betterAuthUserId]` on the table `admin_users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[betterAuthUserId]` on the table `industry_supervisors` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[betterAuthUserId]` on the table `school_supervisors` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `students` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[betterAuthUserId]` on the table `students` will be added. If there are existing duplicate values, this will fail.
  - Made the column `betterAuthUserId` on table `admin_users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `betterAuthUserId` on table `industry_supervisors` required. This step will fail if there are existing NULL values in that column.
  - Made the column `betterAuthUserId` on table `school_supervisors` required. This step will fail if there are existing NULL values in that column.
  - Made the column `betterAuthUserId` on table `students` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "admin_users" DROP COLUMN "passwordHash",
ALTER COLUMN "betterAuthUserId" SET NOT NULL;

-- AlterTable
ALTER TABLE "industry_supervisors" ALTER COLUMN "betterAuthUserId" SET NOT NULL;

-- AlterTable
ALTER TABLE "school_supervisors" DROP COLUMN "passwordHash",
ALTER COLUMN "betterAuthUserId" SET NOT NULL;

-- AlterTable
ALTER TABLE "session" ADD COLUMN     "impersonatedBy" TEXT;

-- AlterTable
ALTER TABLE "student_session_enrollments" DROP COLUMN "isActive";

-- AlterTable
ALTER TABLE "students" DROP COLUMN "passwordHash",
ALTER COLUMN "betterAuthUserId" SET NOT NULL;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "banExpires" TIMESTAMP(3),
ADD COLUMN     "banReason" TEXT,
ADD COLUMN     "banned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user',
ALTER COLUMN "email" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_betterAuthUserId_key" ON "admin_users"("betterAuthUserId");

-- CreateIndex
CREATE UNIQUE INDEX "industry_supervisors_betterAuthUserId_key" ON "industry_supervisors"("betterAuthUserId");

-- CreateIndex
CREATE UNIQUE INDEX "school_supervisors_betterAuthUserId_key" ON "school_supervisors"("betterAuthUserId");

-- CreateIndex
CREATE INDEX "student_supervisor_assignments_assignedBy_idx" ON "student_supervisor_assignments"("assignedBy");

-- CreateIndex
CREATE UNIQUE INDEX "students_email_key" ON "students"("email");

-- CreateIndex
CREATE UNIQUE INDEX "students_betterAuthUserId_key" ON "students"("betterAuthUserId");

-- CreateIndex
CREATE INDEX "user_email_idx" ON "user"("email");

-- AddForeignKey
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_betterAuthUserId_fkey" FOREIGN KEY ("betterAuthUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_betterAuthUserId_fkey" FOREIGN KEY ("betterAuthUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_supervisors" ADD CONSTRAINT "school_supervisors_betterAuthUserId_fkey" FOREIGN KEY ("betterAuthUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "industry_supervisors" ADD CONSTRAINT "industry_supervisors_betterAuthUserId_fkey" FOREIGN KEY ("betterAuthUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
