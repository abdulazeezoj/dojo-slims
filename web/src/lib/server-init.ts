import { getLogger } from "./logger";
import { ensureSuperAdmin } from "./setup-superadmin";

const logger = getLogger(["lib", "server-init"]);

export async function initializeServer() {
  logger.info("Server initialization started");

  try {
    await ensureSuperAdmin();
    logger.info("Server initialization completed successfully");
  } catch (error) {
    logger.error("Server initialization failed", { error });
  }
}
