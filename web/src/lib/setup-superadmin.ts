import { hashPassword } from "./auth-utils";
import { config } from "./config";
import { getLogger } from "./logger";
import prisma from "./prisma";

const logger = getLogger(["lib", "setup-superadmin"]);

/**
 * Ensures a super admin user exists in the system.
 * This function is idempotent and safe to call multiple times.
 * It will create the super admin if it doesn't exist, or update if it does.
 */
export async function ensureSuperAdmin() {
  try {
    const email = config.SUPERADMIN_EMAIL;
    const password = config.SUPERADMIN_PASSWORD;
    const name = config.SUPERADMIN_NAME;

    // Check if super admin already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: {
        accounts: {
          where: { providerId: "credential" },
        },
        adminProfile: true,
      },
    });

    if (existingUser) {
      logger.info("Super admin user already exists", { email });

      // Ensure user has admin role and is verified
      if (existingUser.role !== "admin" || !existingUser.emailVerified) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            role: "admin",
            emailVerified: true,
          },
        });
        logger.info("Updated super admin user role and verification", {
          email,
        });
      }

      // Ensure AdminUser record exists
      if (!existingUser.adminProfile) {
        await prisma.adminUser.create({
          data: {
            id: crypto.randomUUID(),
            adminId: config.SUPERADMIN_USERNAME,
            name,
            email,
            userId: existingUser.id,
          },
        });
        logger.info("Created AdminUser record for super admin", { email });
      }

      return;
    }

    // Create new super admin user
    logger.info("Creating super admin user", { email });

    const userId = crypto.randomUUID();
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        id: userId,
        email,
        name,
        username: "superadmin",
        displayUsername: "SUPERADMIN",
        userType: "ADMIN",
        role: "admin",
        emailVerified: true,
      },
    });

    // Create credential account with password
    await prisma.account.create({
      data: {
        id: crypto.randomUUID(),
        accountId: userId,
        providerId: "credential",
        userId,
        password: hashedPassword,
      },
    });

    // Create AdminUser record
    await prisma.adminUser.create({
      data: {
        id: crypto.randomUUID(),
        adminId: "SUPERADMIN",
        name,
        email,
        userId: user.id,
      },
    });

    logger.info("Super admin user created successfully", { email });
  } catch (error) {
    logger.error("Failed to ensure super admin exists", { error });
    // Don't throw - we don't want to crash the app if this fails
    // The super admin can be created manually if needed
  }
}
