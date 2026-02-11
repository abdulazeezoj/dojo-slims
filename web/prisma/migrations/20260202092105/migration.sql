/*
  Warnings:

  - You are about to drop the column `betterAuthUserId` on the `admin_users` table. All the data in the column will be lost.
  - You are about to drop the column `betterAuthUserId` on the `industry_supervisors` table. All the data in the column will be lost.
  - You are about to drop the column `betterAuthUserId` on the `school_supervisors` table. All the data in the column will be lost.
  - You are about to drop the column `betterAuthUserId` on the `students` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `admin_users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `industry_supervisors` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `school_supervisors` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `students` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `admin_users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `industry_supervisors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `school_supervisors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `students` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "admin_users" DROP CONSTRAINT "admin_users_betterAuthUserId_fkey";

-- DropForeignKey
ALTER TABLE "industry_supervisors" DROP CONSTRAINT "industry_supervisors_betterAuthUserId_fkey";

-- DropForeignKey
ALTER TABLE "school_supervisors" DROP CONSTRAINT "school_supervisors_betterAuthUserId_fkey";

-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_betterAuthUserId_fkey";

-- DropIndex
DROP INDEX "admin_users_betterAuthUserId_idx";

-- DropIndex
DROP INDEX "admin_users_betterAuthUserId_key";

-- DropIndex
DROP INDEX "industry_supervisors_betterAuthUserId_idx";

-- DropIndex
DROP INDEX "industry_supervisors_betterAuthUserId_key";

-- DropIndex
DROP INDEX "school_supervisors_betterAuthUserId_idx";

-- DropIndex
DROP INDEX "school_supervisors_betterAuthUserId_key";

-- DropIndex
DROP INDEX "students_betterAuthUserId_idx";

-- DropIndex
DROP INDEX "students_betterAuthUserId_key";

-- AlterTable
ALTER TABLE "admin_users" DROP COLUMN "betterAuthUserId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "industry_supervisors" DROP COLUMN "betterAuthUserId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "school_supervisors" DROP COLUMN "betterAuthUserId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "students" DROP COLUMN "betterAuthUserId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_userId_key" ON "admin_users"("userId");

-- CreateIndex
CREATE INDEX "admin_users_userId_idx" ON "admin_users"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "industry_supervisors_userId_key" ON "industry_supervisors"("userId");

-- CreateIndex
CREATE INDEX "industry_supervisors_userId_idx" ON "industry_supervisors"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "school_supervisors_userId_key" ON "school_supervisors"("userId");

-- CreateIndex
CREATE INDEX "school_supervisors_userId_idx" ON "school_supervisors"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "students_userId_key" ON "students"("userId");

-- CreateIndex
CREATE INDEX "students_userId_idx" ON "students"("userId");

-- AddForeignKey
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_supervisors" ADD CONSTRAINT "school_supervisors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "industry_supervisors" ADD CONSTRAINT "industry_supervisors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
