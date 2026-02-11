// import prisma from "../src/lib/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "@/lib/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/auth-utils";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

const generateId = () => crypto.randomUUID();

// Helper to create user with Prisma (supports both password and passwordless)
async function createUser(data: {
  email: string;
  password?: string; // Optional - if not provided, user will use magic link
  name: string;
  username?: string;
  userType: "ADMIN" | "STUDENT" | "SCHOOL_SUPERVISOR" | "INDUSTRY_SUPERVISOR";
  role?: string;
}) {
  try {
    const userId = generateId();

    // Create the user record
    const user = await prisma.user.create({
      data: {
        id: userId,
        email: data.email,
        name: data.name,
        username: data.username,
        displayUsername: data.username,
        userType: data.userType,
        role: data.role || "user",
        emailVerified: true, // Auto-verify for seed data
      },
    });

    // If password is provided, create credential account
    if (data.password) {
      const hashedPassword = await hashPassword(data.password);

      await prisma.account.create({
        data: {
          id: generateId(),
          accountId: userId, // accountId equals userId for credential accounts
          providerId: "credential",
          userId,
          password: hashedPassword,
        },
      });
    }

    return user;
  } catch (error) {
    console.error(`Error creating user ${data.email}:`, error);
    throw error;
  }
}

async function main() {
  console.info("🌱 Starting seed...");

  const generateId = () => crypto.randomUUID();
  const SEED_PASSWORD = "demo1234"; // All users get the same password for demo

  // Clean existing data (in reverse order of dependencies)
  console.info("🧹 Cleaning existing data...");
  await prisma.industrySupervisorFinalComment.deleteMany();
  await prisma.schoolSupervisorFinalComment.deleteMany();
  await prisma.industrySupervisorReviewRequest.deleteMany();
  await prisma.industrySupervisorWeeklyComment.deleteMany();
  await prisma.schoolSupervisorWeeklyComment.deleteMany();
  await prisma.diagram.deleteMany();
  await prisma.weeklyEntry.deleteMany();
  await prisma.logbookMetadata.deleteMany();
  await prisma.studentSiwesDetail.deleteMany();
  await prisma.studentSupervisorAssignment.deleteMany();
  await prisma.supervisorSessionEnrollment.deleteMany();
  await prisma.studentSessionEnrollment.deleteMany();
  await prisma.industrySupervisor.deleteMany();
  await prisma.schoolSupervisor.deleteMany();
  await prisma.student.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.placementOrganization.deleteMany();
  await prisma.siwesSession.deleteMany();
  await prisma.department.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // Create Faculties
  console.info("📚 Creating faculties...");
  const facultyOfScience = await prisma.faculty.create({
    data: {
      id: generateId(),
      name: "Faculty of Science",
      code: "SCI",
    },
  });

  const facultyOfEngineering = await prisma.faculty.create({
    data: {
      id: generateId(),
      name: "Faculty of Engineering",
      code: "ENG",
    },
  });

  // Create Departments
  console.info("🏢 Creating departments...");
  const deptComputerScience = await prisma.department.create({
    data: {
      id: generateId(),
      facultyId: facultyOfScience.id,
      name: "Computer Science",
      code: "CSC",
    },
  });

  const deptMathematics = await prisma.department.create({
    data: {
      id: generateId(),
      facultyId: facultyOfScience.id,
      name: "Mathematics",
      code: "MTH",
    },
  });

  const deptElectricalEngineering = await prisma.department.create({
    data: {
      id: generateId(),
      facultyId: facultyOfEngineering.id,
      name: "Electrical Engineering",
      code: "EEE",
    },
  });

  // Create Placement Organizations
  console.info("🏭 Creating placement organizations...");
  const techCorp = await prisma.placementOrganization.create({
    data: {
      id: generateId(),
      name: "TechCorp Solutions Ltd",
      address: "123 Innovation Drive",
      city: "Lagos",
      state: "Lagos",
      phone: "+2348012345678",
      email: "hr@techcorp.com",
    },
  });

  const dataSystems = await prisma.placementOrganization.create({
    data: {
      id: generateId(),
      name: "Data Systems Nigeria",
      address: "45 Database Road",
      city: "Abuja",
      state: "FCT",
      phone: "+2348098765432",
      email: "contact@datasystems.ng",
    },
  });

  const engineeringHub = await prisma.placementOrganization.create({
    data: {
      id: generateId(),
      name: "Engineering Hub Limited",
      address: "78 Circuit Avenue",
      city: "Port Harcourt",
      state: "Rivers",
      phone: "+2348123456789",
      email: "info@engineeringhub.com",
    },
  });

  // Create SIWES Session
  console.info("📅 Creating SIWES session...");
  const currentSession = await prisma.siwesSession.create({
    data: {
      id: generateId(),
      name: "2025/2026",
      startDate: new Date("2025-07-01"),
      endDate: new Date("2025-12-31"),
      totalWeeks: 24,
      status: "ACTIVE",
    },
  });

  const previousSession = await prisma.siwesSession.create({
    data: {
      id: generateId(),
      name: "2024/2025",
      startDate: new Date("2024-07-01"),
      endDate: new Date("2024-12-31"),
      totalWeeks: 24,
      status: "CLOSED",
    },
  });

  // Create Admin User
  console.info("👤 Creating admin user...");
  const user = await createUser({
    email: config.SUPERADMIN_EMAIL,
    password: config.SUPERADMIN_PASSWORD,
    name: config.SUPERADMIN_NAME,
    username: config.SUPERADMIN_USERNAME,
    userType: "ADMIN",
    role: "admin",
  });

  const admin = await prisma.adminUser.create({
    data: {
      id: generateId(),
      adminId: config.SUPERADMIN_USERNAME,
      name: user.name || config.SUPERADMIN_NAME,
      email: user.email,
      userId: user.id,
    },
  });

  // Create School Supervisors
  console.info("👨‍🏫 Creating school supervisors...");
  const supervisors = [];
  for (let i = 1; i <= 3; i++) {
    const deptId =
      i === 1
        ? deptComputerScience.id
        : i === 2
          ? deptMathematics.id
          : deptElectricalEngineering.id;

    const user = await createUser({
      email: `supervisor${i}@slims.edu.ng`,
      password: SEED_PASSWORD,
      name: `Dr. Supervisor ${i}`,
      username: `supervisor${i}`,
      userType: "SCHOOL_SUPERVISOR",
    });

    const supervisor = await prisma.schoolSupervisor.create({
      data: {
        id: generateId(),
        staffId: `SUP00${i}`,
        name: `Dr. Supervisor ${i}`,
        email: `supervisor${i}@slims.edu.ng`,
        departmentId: deptId,
        phone: `+234801234567${i}`,
        userId: user.id,
      },
    });

    // Enroll supervisors in current session
    await prisma.supervisorSessionEnrollment.create({
      data: {
        id: generateId(),
        schoolSupervisorId: supervisor.id,
        siwesSessionId: currentSession.id,
        enrolledAt: new Date("2025-06-01"),
      },
    });

    supervisors.push(supervisor);
  }

  // Create Industry Supervisors
  console.info("👨‍💼 Creating industry supervisors...");
  const industrySupervisors = [];
  const orgs = [techCorp, dataSystems, engineeringHub];

  for (let i = 1; i <= 3; i++) {
    // Industry supervisors use magic link (passwordless) authentication
    const supervisorName = `${orgs[i - 1].name.split(" ")[0]} Supervisor ${i}`;
    const supervisorEmail = `industry${i}@example.com`;

    // Create the User record for magic link auth (no password)
    const user = await createUser({
      email: supervisorEmail,
      name: supervisorName,
      userType: "INDUSTRY_SUPERVISOR",
    });

    // Update emailVerified to false for magic link users
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: false },
    });

    // Create the IndustrySupervisor record
    const industrySupervisor = await prisma.industrySupervisor.create({
      data: {
        id: generateId(),
        name: supervisorName,
        email: supervisorEmail,
        placementOrganizationId: orgs[i - 1].id,
        position:
          i === 1
            ? "Senior Developer"
            : i === 2
              ? "Data Analyst Lead"
              : "Electrical Engineer",
        phone: `+234809876543${i}`,
        userId: user.id,
      },
    });

    industrySupervisors.push(industrySupervisor);
  }

  // Create Students with complete profiles
  console.info("👨‍🎓 Creating students...");
  const students = [];
  const studentData = [
    {
      name: "John Doe",
      matric: "U21CS1234",
      email: "john.doe@student.edu.ng",
      dept: deptComputerScience.id,
      org: techCorp,
      industrySupervisor: industrySupervisors[0],
      schoolSupervisor: supervisors[0],
    },
    {
      name: "Jane Smith",
      matric: "U21CS1235",
      email: "jane.smith@student.edu.ng",
      dept: deptComputerScience.id,
      org: dataSystems,
      industrySupervisor: industrySupervisors[1],
      schoolSupervisor: supervisors[0],
    },
    {
      name: "Michael Johnson",
      matric: "U21MT2345",
      email: "michael.j@student.edu.ng",
      dept: deptMathematics.id,
      org: dataSystems,
      industrySupervisor: industrySupervisors[1],
      schoolSupervisor: supervisors[1],
    },
    {
      name: "Sarah Williams",
      matric: "U21EE3456",
      email: "sarah.w@student.edu.ng",
      dept: deptElectricalEngineering.id,
      org: engineeringHub,
      industrySupervisor: industrySupervisors[2],
      schoolSupervisor: supervisors[2],
    },
    {
      name: "David Brown",
      matric: "U21CS1236",
      email: "david.b@student.edu.ng",
      dept: deptComputerScience.id,
      org: techCorp,
      industrySupervisor: industrySupervisors[0],
      schoolSupervisor: supervisors[0],
    },
  ];

  for (const data of studentData) {
    const user = await createUser({
      email: data.email,
      password: SEED_PASSWORD,
      name: data.name,
      username: data.matric.toUpperCase().replace(/\//g, ""),
      userType: "STUDENT",
    });

    const student = await prisma.student.create({
      data: {
        id: generateId(),
        matricNumber: data.matric,
        name: data.name,
        email: data.email,
        departmentId: data.dept,
        userId: user.id,
      },
    });

    // Enroll in current session
    await prisma.studentSessionEnrollment.create({
      data: {
        id: generateId(),
        studentId: student.id,
        siwesSessionId: currentSession.id,
        enrolledAt: new Date("2025-06-15"),
      },
    });

    // Assign school supervisor
    await prisma.studentSupervisorAssignment.create({
      data: {
        id: generateId(),
        studentId: student.id,
        schoolSupervisorId: data.schoolSupervisor.id,
        siwesSessionId: currentSession.id,
        assignedBy: admin.id,
        assignmentMethod: "MANUAL",
        assignedAt: new Date("2025-06-20"),
      },
    });

    // Create SIWES details
    await prisma.studentSiwesDetail.create({
      data: {
        id: generateId(),
        studentId: student.id,
        siwesSessionId: currentSession.id,
        placementOrganizationId: data.org.id,
        industrySupervisorId: data.industrySupervisor.id,
        trainingStartDate: new Date("2025-07-01"),
        trainingEndDate: new Date("2025-12-31"),
        jobTitle: "IT Intern",
        departmentAtOrg: "Software Development",
      },
    });

    // Create logbook metadata
    await prisma.logbookMetadata.create({
      data: {
        id: generateId(),
        studentId: student.id,
        siwesSessionId: currentSession.id,
        programOfStudy:
          data.dept === deptComputerScience.id
            ? "Computer Science"
            : data.dept === deptMathematics.id
              ? "Mathematics"
              : "Electrical Engineering",
        level: "400",
        session: "2025/2026",
        trainingDuration: "6 months",
        areaOfSpecialization:
          data.dept === deptComputerScience.id
            ? "Software Development"
            : data.dept === deptMathematics.id
              ? "Statistics"
              : "Power Systems",
      },
    });

    students.push({ ...student, data });
  }

  // Create Weekly Entries with comments and reviews
  console.info("📝 Creating weekly entries...");
  for (const student of students) {
    // Create entries for weeks 1-4 (with varying completion)
    for (let week = 1; week <= 4; week++) {
      const isComplete = week <= 2;
      const hasReview = week === 1;

      const weeklyEntry = await prisma.weeklyEntry.create({
        data: {
          id: generateId(),
          studentId: student.id,
          siwesSessionId: currentSession.id,
          weekNumber: week,
          mondayEntry: isComplete
            ? `Week ${week} - Monday: Attended orientation and setup development environment.`
            : null,
          tuesdayEntry: isComplete
            ? `Week ${week} - Tuesday: Started learning the company's tech stack and coding standards.`
            : null,
          wednesdayEntry: isComplete
            ? `Week ${week} - Wednesday: Worked on a simple feature under senior developer guidance.`
            : null,
          thursdayEntry: isComplete
            ? `Week ${week} - Thursday: Participated in code review sessions and learned best practices.`
            : null,
          fridayEntry: isComplete
            ? `Week ${week} - Friday: Completed my first task and submitted for review.`
            : null,
          saturdayEntry: isComplete
            ? `Week ${week} - Saturday: Reviewed feedback and made necessary improvements.`
            : null,
          isLocked: hasReview,
          lockedBy: hasReview ? "INDUSTRY_SUPERVISOR" : null,
          lockedAt: hasReview ? new Date("2025-07-08") : null,
        },
      });

      // Add diagram for week 2
      if (week === 2 && isComplete) {
        await prisma.diagram.create({
          data: {
            id: generateId(),
            weeklyEntryId: weeklyEntry.id,
            fileName: "system-architecture.png",
            filePath: "/uploads/diagrams/system-architecture.png",
            fileSize: 245678,
            mimeType: "image/png",
            caption: "System architecture diagram showing the main components",
            uploadedAt: new Date("2025-07-14"),
          },
        });
      }

      // Add comments for week 1
      if (hasReview) {
        await prisma.industrySupervisorWeeklyComment.create({
          data: {
            id: generateId(),
            weeklyEntryId: weeklyEntry.id,
            industrySupervisorId: student.data.industrySupervisor.id,
            comment:
              "Good start! Your entries show good attention to detail. Keep up the enthusiasm and continue documenting your learning process.",
            commentedAt: new Date("2025-07-08"),
          },
        });
      }

      // Add review request for week 3
      if (week === 3 && isComplete) {
        await prisma.industrySupervisorReviewRequest.create({
          data: {
            id: generateId(),
            weeklyEntryId: weeklyEntry.id,
            studentId: student.id,
            industrySupervisorId: student.data.industrySupervisor.id,
            status: "PENDING",
            requestedAt: new Date("2025-07-21"),
          },
        });
      }
    }
  }

  // Add final comments for one student
  console.info("💬 Creating final comments...");
  await prisma.industrySupervisorFinalComment.create({
    data: {
      id: generateId(),
      studentId: students[0].id,
      siwesSessionId: previousSession.id,
      industrySupervisorId: industrySupervisors[0].id,
      comment:
        "Excellent performance throughout the SIWES program. Showed great initiative and technical skills.",
      rating: "Outstanding",
      commentedAt: new Date("2024-12-30"),
    },
  });

  await prisma.schoolSupervisorFinalComment.create({
    data: {
      id: generateId(),
      studentId: students[0].id,
      siwesSessionId: previousSession.id,
      schoolSupervisorId: supervisors[0].id,
      comment:
        "Demonstrated strong work ethic and professionalism. Highly recommended for future opportunities.",
      rating: "Excellent",
      commentedAt: new Date("2024-12-31"),
    },
  });

  console.info("✅ Seed completed successfully!");
  console.info("\n📋 Demo Credentials:");
  console.info("==================");
  console.info("\n🔐 Password-based Login (password: demo123):");
  console.info("\nAdmin:");
  console.info("  Email: admin@slims.edu.ng");
  console.info("\nSchool Supervisors:");
  console.info("  Email: supervisor1@slims.edu.ng (Computer Science)");
  console.info("  Email: supervisor2@slims.edu.ng (Mathematics)");
  console.info("  Email: supervisor3@slims.edu.ng (Electrical Engineering)");
  console.info("\nStudents:");
  console.info("  Email: john.doe@student.edu.ng");
  console.info("  Email: jane.smith@student.edu.ng");
  console.info("  Email: michael.j@student.edu.ng");
  console.info("  Email: sarah.w@student.edu.ng");
  console.info("  Email: david.b@student.edu.ng");
  console.info("\n🔗 Magic Link Login (passwordless):");
  console.info("\nIndustry Supervisors:");
  console.info("  Email: industry1@example.com (TechCorp)");
  console.info("  Email: industry2@example.com (Data Systems)");
  console.info("  Email: industry3@example.com (Engineering Hub)");
  console.info(
    "\n  Note: Use magic link at login to receive email authentication link",
  );
  console.info("\n==================\n");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
