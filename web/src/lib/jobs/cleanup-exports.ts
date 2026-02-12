import { ExportService } from "@/lib/export-service";
import { getLogger } from "@/lib/logger";

const logger = getLogger(["cleanup", "exports"]);

/**
 * Cleanup expired export files
 * This function is now called via BullMQ scheduled task
 * See: src/tasks/cleanup-exports.ts
 * For standalone execution, use: npm run cleanup:exports
 */
export async function cleanupExpiredExports() {
  logger.info("Starting expired exports cleanup...");

  try {
    const deletedCount = await ExportService.cleanupExpiredFiles();
    logger.info(`Deleted ${deletedCount} expired export files`);
    return deletedCount;
  } catch (error) {
    logger.error("Failed to cleanup exports", { error });
    throw error;
  }
}

// If running as standalone script (for manual execution or cron fallback)
if (require.main === module) {
  cleanupExpiredExports()
    .then((count) => {
      console.log(`[Cleanup] Job completed successfully. Deleted ${count} files.`);
      process.exit(0);
    })
    .catch((error) => {
      console.error("[Cleanup] Job failed:", error);
      process.exit(1);
    });
}
