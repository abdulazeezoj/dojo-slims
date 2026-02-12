-- CreateTable
CREATE TABLE "exported_files" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "maxDownloads" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exported_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exported_files_userId_idx" ON "exported_files"("userId");

-- CreateIndex
CREATE INDEX "exported_files_expiresAt_idx" ON "exported_files"("expiresAt");

-- CreateIndex
CREATE INDEX "exported_files_createdAt_idx" ON "exported_files"("createdAt");

-- AddForeignKey
ALTER TABLE "exported_files" ADD CONSTRAINT "exported_files_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
