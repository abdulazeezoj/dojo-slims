import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BriefcaseIcon,
  ChalkboardTeacherIcon,
  GraduationCapIcon,
  StudentIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your SLIMS account",
};

const roles = [
  {
    id: "student",
    title: "Student",
    description: "Students undergoing SIWES training",
    icon: StudentIcon,
    href: "/auth/login/student",
  },
  {
    id: "admin",
    title: "Admin",
    description: "SIWES Unit administrators",
    icon: BriefcaseIcon,
    href: "/auth/login/admin",
  },
  {
    id: "school-supervisor",
    title: "School Supervisor",
    description: "Academic supervisors from ABU",
    icon: ChalkboardTeacherIcon,
    href: "/auth/login/school-supervisor",
  },
  {
    id: "industry-supervisor",
    title: "Industry Supervisor",
    description: "Industry-based supervisors",
    icon: GraduationCapIcon,
    href: "/auth/login/industry-supervisor",
  },
];

export default function AuthPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Sign in to SLIMS
        </h1>
        <p className="text-muted-foreground text-lg">
          Select your role to continue
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {roles.map((role) => {
          const Icon = role.icon;
          return (
            <Link
              key={role.id}
              href={role.href}
              className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl"
            >
              <Card className="h-full transition-all hover:border-primary hover:scale-105 group-focus-visible:border-primary group-focus-visible:scale-105">
                <CardHeader>
                  <Icon
                    size={40}
                    weight="duotone"
                    className="text-primary mb-2"
                  />
                  <CardTitle>{role.title}</CardTitle>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium text-primary">Sign In →</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="text-center">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
