/*
  Warnings:

  - You are about to drop the column `userReferenceId` on the `user` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "student_supervisor_assignments" DROP CONSTRAINT "student_supervisor_assignments_assignedBy_fkey";

-- DropIndex
DROP INDEX "user_userType_userReferenceId_idx";

-- DropIndex
DROP INDEX "user_userType_userReferenceId_key";

-- AlterTable
ALTER TABLE "school_supervisors" ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "student_session_enrollments" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "student_supervisor_assignments" ALTER COLUMN "assignedBy" DROP NOT NULL;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "userReferenceId";

-- CreateIndex
CREATE INDEX "user_userType_idx" ON "user"("userType");

-- AddForeignKey
ALTER TABLE "student_supervisor_assignments" ADD CONSTRAINT "student_supervisor_assignments_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
