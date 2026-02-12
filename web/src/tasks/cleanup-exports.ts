import { ExportService } from "@/lib/export-service";

export type CleanupExportsData = Record<string, never>;

export interface CleanupExportsResult {
  deletedCount: number;
  timestamp: string;
}

/**
 * Task handler to cleanup expired export files
 * This task is scheduled to run periodically via BullMQ
 */
export async function cleanupExports(): Promise<CleanupExportsResult> {
  const deletedCount = await ExportService.cleanupExpiredFiles();

  return {
    deletedCount,
    timestamp: new Date().toISOString(),
  };
}
