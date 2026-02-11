-- AlterTable
ALTER TABLE "industry_supervisors" ADD COLUMN     "currentSiwesSessionId" TEXT;

-- AlterTable
ALTER TABLE "school_supervisors" ADD COLUMN     "currentSiwesSessionId" TEXT;

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "currentSiwesSessionId" TEXT;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_currentSiwesSessionId_fkey" FOREIGN KEY ("currentSiwesSessionId") REFERENCES "siwes_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_supervisors" ADD CONSTRAINT "school_supervisors_currentSiwesSessionId_fkey" FOREIGN KEY ("currentSiwesSessionId") REFERENCES "siwes_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "industry_supervisors" ADD CONSTRAINT "industry_supervisors_currentSiwesSessionId_fkey" FOREIGN KEY ("currentSiwesSessionId") REFERENCES "siwes_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
