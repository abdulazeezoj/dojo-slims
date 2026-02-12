import { ExportService } from "@/lib/export-service";

/**
 * Cron job to cleanup expired exports
 * Run this every hour or via scheduled task
 */
export async function cleanupExpiredExports() {
  console.log("[Cleanup] Starting expired exports cleanup...");

  try {
    const deletedCount = await ExportService.cleanupExpiredFiles();
    console.log(`[Cleanup] Deleted ${deletedCount} expired export files`);
    return deletedCount;
  } catch (error) {
    console.error("[Cleanup] Failed to cleanup exports:", error);
    throw error;
  }
}

// If running as standalone script
if (require.main === module) {
  cleanupExpiredExports()
    .then(() => {
      console.log("[Cleanup] Job completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("[Cleanup] Job failed:", error);
      process.exit(1);
    });
}
