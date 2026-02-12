# Export Directory Security & File Expiry Guide

## Overview

This document addresses the security concerns and best practices for implementing a PDF export system with download links that have expiry times, specifically designed to offload file serving from the Next.js server.

## Current Situation Analysis

### Your Proposed Approach
- Generate PDFs and save them to `/web/export` directory
- Serve files via `bun serve` (development) or nginx (production)
- Implement file expiry and automatic cleanup
- Plan to migrate to CDN when scaling is needed

### Security Assessment

#### ✅ Advantages
1. **Performance**: Offloads file serving from Next.js application server
2. **Scalability**: Static file serving is highly efficient
3. **CDN-Ready**: Easy migration path to S3/R2/CloudFlare
4. **Resource Efficiency**: Reduces Node.js memory usage

#### ❌ Security Concerns
1. **No Built-in Authentication**: Static file servers (nginx, bun serve) bypass Next.js authentication
2. **Predictable URLs**: If filenames are guessable, unauthorized access is possible
3. **No Access Auditing**: Difficult to track who downloaded what files
4. **No Rate Limiting**: Users could potentially mass-download files
5. **Race Conditions**: Files might be deleted while being downloaded
6. **Storage Management**: Requires careful cleanup jobs to prevent disk exhaustion

## Recommended Solution: Signed URL Approach

### Architecture Overview

Instead of direct static file access, implement a **signed URL system** similar to AWS S3 presigned URLs:

```
GET /api/export/{fileId}?token={jwt_token}
```

### Implementation Components

#### 1. Database Schema

```prisma
model ExportedFile {
  id                String   @id @default(uuid())
  userId            String   // Who requested the export
  fileType          String   // "PDF_LOGBOOK", "BULK_EXPORT", etc.
  fileName          String   // Original filename
  filePath          String   // Physical path on disk
  fileSize          Int      // Size in bytes
  expiresAt         DateTime // When file expires
  downloadCount     Int      @default(0)
  maxDownloads      Int?     // Optional download limit
  createdAt         DateTime @default(now())

  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
  @@index([createdAt])
}
```

#### 2. Export Service (`/src/lib/export-service.ts`)

```typescript
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { config } from '@/lib/config';
import fs from 'fs/promises';
import path from 'path';

interface CreateExportOptions {
  userId: string;
  fileType: string;
  fileName: string;
  fileBuffer: Buffer;
  expiresInMinutes?: number;
  maxDownloads?: number;
}

interface DownloadTokenPayload {
  fileId: string;
  userId: string;
  exp: number;
}

export class ExportService {
  private static EXPORT_DIR = path.join(process.cwd(), 'export');
  private static TOKEN_SECRET = config.EXPORT_TOKEN_SECRET; // Add to config

  /**
   * Create a new export file with signed URL
   */
  static async createExport(options: CreateExportOptions) {
    const {
      userId,
      fileType,
      fileName,
      fileBuffer,
      expiresInMinutes = 15, // Default 15 minutes
      maxDownloads,
    } = options;

    // Generate unique filename to prevent collisions
    const fileId = crypto.randomUUID();
    const ext = path.extname(fileName);
    const safeFileName = `${fileId}${ext}`;
    const filePath = path.join(this.EXPORT_DIR, safeFileName);

    // Ensure export directory exists
    await fs.mkdir(this.EXPORT_DIR, { recursive: true });

    // Write file to disk
    await fs.writeFile(filePath, fileBuffer);

    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    // Create database record
    const exportRecord = await prisma.exportedFile.create({
      data: {
        id: fileId,
        userId,
        fileType,
        fileName,
        filePath,
        fileSize: fileBuffer.length,
        expiresAt,
        maxDownloads,
      },
    });

    // Generate signed token
    const token = this.generateDownloadToken(fileId, userId, expiresAt);

    // Generate download URL
    const downloadUrl = `/api/export/${fileId}?token=${token}`;

    return {
      fileId,
      downloadUrl,
      expiresAt,
      fileName,
    };
  }

  /**
   * Generate JWT token for download authentication
   */
  private static generateDownloadToken(
    fileId: string,
    userId: string,
    expiresAt: Date
  ): string {
    const payload: DownloadTokenPayload = {
      fileId,
      userId,
      exp: Math.floor(expiresAt.getTime() / 1000),
    };

    return jwt.sign(payload, this.TOKEN_SECRET, {
      algorithm: 'HS256',
    });
  }

  /**
   * Verify download token and check permissions
   */
  static async verifyDownloadToken(
    fileId: string,
    token: string
  ): Promise<{ valid: boolean; exportRecord?: any; error?: string }> {
    try {
      // Verify JWT signature and expiry
      const payload = jwt.verify(token, this.TOKEN_SECRET) as DownloadTokenPayload;

      // Check fileId matches
      if (payload.fileId !== fileId) {
        return { valid: false, error: 'Invalid token for this file' };
      }

      // Fetch export record
      const exportRecord = await prisma.exportedFile.findUnique({
        where: { id: fileId },
        include: { user: true },
      });

      if (!exportRecord) {
        return { valid: false, error: 'File not found' };
      }

      // Check if expired
      if (exportRecord.expiresAt < new Date()) {
        // Clean up expired file
        await this.deleteExportFile(fileId);
        return { valid: false, error: 'File has expired' };
      }

      // Check download limit
      if (
        exportRecord.maxDownloads &&
        exportRecord.downloadCount >= exportRecord.maxDownloads
      ) {
        return { valid: false, error: 'Download limit exceeded' };
      }

      // Check user matches
      if (exportRecord.userId !== payload.userId) {
        return { valid: false, error: 'Unauthorized' };
      }

      return { valid: true, exportRecord };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return { valid: false, error: 'Token has expired' };
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return { valid: false, error: 'Invalid token' };
      }
      return { valid: false, error: 'Token verification failed' };
    }
  }

  /**
   * Increment download counter
   */
  static async recordDownload(fileId: string): Promise<void> {
    await prisma.exportedFile.update({
      where: { id: fileId },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    });
  }

  /**
   * Delete export file from disk and database
   */
  static async deleteExportFile(fileId: string): Promise<void> {
    const exportRecord = await prisma.exportedFile.findUnique({
      where: { id: fileId },
    });

    if (!exportRecord) return;

    // Delete from disk
    try {
      await fs.unlink(exportRecord.filePath);
    } catch (error) {
      console.error(`Failed to delete file ${exportRecord.filePath}:`, error);
    }

    // Delete from database
    await prisma.exportedFile.delete({
      where: { id: fileId },
    });
  }

  /**
   * Cleanup expired files (run as cron job)
   */
  static async cleanupExpiredFiles(): Promise<number> {
    const expiredFiles = await prisma.exportedFile.findMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    let deletedCount = 0;

    for (const file of expiredFiles) {
      try {
        await this.deleteExportFile(file.id);
        deletedCount++;
      } catch (error) {
        console.error(`Failed to cleanup file ${file.id}:`, error);
      }
    }

    return deletedCount;
  }
}
```

#### 3. API Route (`/src/app/api/export/[fileId]/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { ExportService } from '@/lib/export-service';
import fs from 'fs/promises';

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  const { fileId } = params;
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { error: 'Missing authentication token' },
      { status: 401 }
    );
  }

  // Verify token and permissions
  const verification = await ExportService.verifyDownloadToken(fileId, token);

  if (!verification.valid) {
    return NextResponse.json(
      { error: verification.error || 'Unauthorized' },
      { status: 403 }
    );
  }

  const { exportRecord } = verification;

  try {
    // Read file from disk
    const fileBuffer = await fs.readFile(exportRecord.filePath);

    // Record download
    await ExportService.recordDownload(fileId);

    // Determine content type
    const contentType = exportRecord.fileType === 'PDF_LOGBOOK'
      ? 'application/pdf'
      : 'application/octet-stream';

    // Return file with proper headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${exportRecord.fileName}"`,
        'Content-Length': exportRecord.fileSize.toString(),
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
      },
    });
  } catch (error) {
    console.error('Error serving export file:', error);
    return NextResponse.json(
      { error: 'Failed to serve file' },
      { status: 500 }
    );
  }
}
```

#### 4. Cleanup Job (`/src/lib/jobs/cleanup-exports.ts`)

```typescript
import { ExportService } from '@/lib/export-service';

/**
 * Cron job to cleanup expired exports
 * Run this every hour or via scheduled task
 */
export async function cleanupExpiredExports() {
  console.log('[Cleanup] Starting expired exports cleanup...');

  try {
    const deletedCount = await ExportService.cleanupExpiredFiles();
    console.log(`[Cleanup] Deleted ${deletedCount} expired export files`);
    return deletedCount;
  } catch (error) {
    console.error('[Cleanup] Failed to cleanup exports:', error);
    throw error;
  }
}

// If running as standalone script
if (require.main === module) {
  cleanupExpiredExports()
    .then(() => {
      console.log('[Cleanup] Job completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[Cleanup] Job failed:', error);
      process.exit(1);
    });
}
```

#### 5. Usage Example (PDF Logbook Generation)

```typescript
// In your existing PDF generation endpoint
import { ExportService } from '@/lib/export-service';
import { PdfGeneratorService } from '@/services/pdf-generator';

export async function POST(request: Request) {
  const session = await getSession(request);
  const { studentId, sessionId } = await request.json();

  // Verify permissions...

  // Generate PDF
  const pdfBuffer = await PdfGeneratorService.generateLogbookPdf(
    studentId,
    sessionId
  );

  // Create export with signed URL
  const exportData = await ExportService.createExport({
    userId: session.user.id,
    fileType: 'PDF_LOGBOOK',
    fileName: `logbook-${studentId}-${sessionId}.pdf`,
    fileBuffer: pdfBuffer,
    expiresInMinutes: 15, // Link expires in 15 minutes
    maxDownloads: 5, // Optional: limit to 5 downloads
  });

  return NextResponse.json({
    success: true,
    downloadUrl: exportData.downloadUrl,
    expiresAt: exportData.expiresAt,
    fileName: exportData.fileName,
  });
}
```

### Configuration Updates

Add to `/src/lib/config.ts`:

```typescript
export const config = {
  // ... existing config

  // Export system
  EXPORT_TOKEN_SECRET: (() => {
    const secret = process.env.EXPORT_TOKEN_SECRET;
    if (!secret) {
      throw new Error(
        'EXPORT_TOKEN_SECRET is not set. Please define a strong, random secret in your environment.'
      );
    }
    return secret;
  })(),
  EXPORT_DEFAULT_EXPIRY_MINUTES: parseInt(process.env.EXPORT_DEFAULT_EXPIRY_MINUTES || '15'),
  EXPORT_MAX_FILE_AGE_HOURS: parseInt(process.env.EXPORT_MAX_FILE_AGE_HOURS || '24'),
};
```

Add to `.env`:

```env
# Export system security
EXPORT_TOKEN_SECRET=your-random-secret-here-minimum-32-characters
EXPORT_DEFAULT_EXPIRY_MINUTES=15
EXPORT_MAX_FILE_AGE_HOURS=24
```

### Cron Job Setup

#### Development (package.json)

```json
{
  "scripts": {
    "cleanup:exports": "tsx lib/jobs/cleanup-exports.ts"
  }
}
```

#### Production (systemd timer or cron)

```bash
# crontab -e
# Run every hour
0 * * * * cd /path/to/app && NODE_ENV=production node lib/jobs/cleanup-exports.js
```

Or use BullMQ with your existing queue system:

```typescript
// Add to your queue configuration
import { Queue } from 'bullmq';
import { cleanupExpiredExports } from '@/lib/jobs/cleanup-exports';

export const exportCleanupQueue = new Queue('export-cleanup', {
  connection: redis,
});

// Add repeatable job
await exportCleanupQueue.add(
  'cleanup-exports',
  {},
  {
    repeat: {
      pattern: '0 * * * *', // Every hour
    },
  }
);

// Worker
const worker = new Worker('export-cleanup', async (job) => {
  await cleanupExpiredExports();
}, {
  connection: redis,
});
```

## Benefits of This Approach

1. ✅ **Authentication**: Every download requires a valid JWT token
2. ✅ **Authorization**: Token is bound to specific user and file
3. ✅ **Expiry**: Both token and file have expiration dates
4. ✅ **Audit Trail**: Download counts and user tracking in database
5. ✅ **Rate Limiting**: Optional download count limits per file
6. ✅ **Automatic Cleanup**: Scheduled job removes expired files
7. ✅ **Security**: Non-guessable UUIDs and cryptographic signatures
8. ✅ **CDN-Ready**: Can add CloudFlare/CDN in front of Next.js API
9. ✅ **Scalability**: Files stored on disk, not in memory

## Migration Path to CDN

When you're ready to scale, migrate to S3/R2:

1. Replace `fs.writeFile` with S3 upload
2. Replace `fs.readFile` with S3 presigned URL generation
3. Keep the same JWT authentication for API endpoint
4. Let S3/R2 handle file serving with their presigned URLs

## Alternative: Pure Static Serving (NOT Recommended)

If you still want to use nginx/bun directly, you MUST:

1. **Use nginx auth_request module** to verify tokens before serving
2. **Generate cryptographically secure random filenames** (UUID v4)
3. **Implement nginx rate limiting**
4. **Set proper Cache-Control headers**
5. **Use separate domain/subdomain** for exports (e.g., export.slims.edu.ng)
6. **Implement nginx logging** for audit trail

This is significantly more complex and harder to maintain than the recommended approach.

## Conclusion

**Recommended**: Use the signed URL approach with Next.js API routes as described above. It provides the best balance of:
- Security (authentication, authorization, auditing)
- Performance (static file serving, optional CDN)
- Maintainability (all logic in TypeScript/Prisma)
- Scalability (easy migration to S3/R2/CloudFlare)

Your intuition about offloading from Next.js is correct, but going directly to static file serving skips critical security layers. The signed URL approach gives you the performance benefits while maintaining security.
