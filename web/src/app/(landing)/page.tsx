import { Section, SectionHeader } from "@/components/landing/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpenIcon,
  ChartLineUpIcon,
  CheckCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export default function LandingPage() {
  return (
    <>
      {/* Hero Section */}
      <Section className="bg-muted/50 py-20 md:py-32">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 text-center">
          <Badge variant="secondary" className="px-4 py-1.5">
            Digital SIWES Management
          </Badge>

          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Transform SIWES Supervision with{" "}
            <span className="text-primary">Digital Logbooks</span>
          </h1>

          <p className="text-muted-foreground max-w-2xl text-lg md:text-xl">
            Replace paper logbooks with a streamlined, transparent, and
            verifiable digital workflow for Ahmadu Bello University&apos;s
            industrial training program.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/auth">
              <Button size="lg">Sign In</Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </Link>
          </div>

          <div className="text-muted-foreground mt-4 text-sm">
            For Students • Supervisors • ABU SIWES Unit
          </div>
        </div>
      </Section>

      {/* Features Section */}
      <Section id="features">
        <SectionHeader
          title="Why SLIMS?"
          description="Built specifically for ABU's SIWES program with features that matter"
        />

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <BookOpenIcon
                size={40}
                weight="duotone"
                className="text-primary mb-2"
              />
              <CardTitle>Digital Logbook</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Document 144+ daily training activities with diagrams and
                attachments. Auto-generate print-ready physical logbooks on
                demand.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <ClockIcon
                size={40}
                weight="duotone"
                className="text-primary mb-2"
              />
              <CardTitle>Remote Supervision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Industry supervisors provide feedback via email links. School
                supervisors monitor progress remotely with consolidated reports.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <ShieldCheckIcon
                size={40}
                weight="duotone"
                className="text-primary mb-2"
              />
              <CardTitle>Verified Records</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                All entries timestamped and permanently recorded. Create
                verifiable digital records for institutional compliance and
                audit purposes.
              </p>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* Workflow Section */}
      <Section id="workflow" className="bg-muted/50">
        <SectionHeader
          title="How It Works"
          description="Simple workflow for all stakeholders"
        />

        <div className="mx-auto max-w-3xl space-y-8">
          <div className="flex gap-4">
            <div className="bg-primary text-primary-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold">
              1
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold">
                Students Document Daily Activities
              </h3>
              <p className="text-muted-foreground text-sm">
                Log daily training activities, upload diagrams, and track your
                24-week progress in real-time.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-primary text-primary-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold">
              2
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold">
                Supervisors Review & Approve
              </h3>
              <p className="text-muted-foreground text-sm">
                Industry supervisors receive email notifications for weekly
                reviews. No login required—just click and approve.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-primary text-primary-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold">
              3
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold">
                ABU Unit Monitors Progress
              </h3>
              <p className="text-muted-foreground text-sm">
                Centralized dashboard for SIWES coordinators to track all
                students, generate reports, and maintain compliance.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Roles Section */}
      <Section id="roles">
        <SectionHeader
          title="Built for Everyone"
          description="Tailored features for each user role"
        />

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <UsersThreeIcon
                size={40}
                weight="duotone"
                className="text-primary mb-2"
              />
              <CardTitle>For Students</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon
                    size={20}
                    weight="fill"
                    className="text-primary mt-0.5 shrink-0"
                  />
                  <span className="text-muted-foreground">
                    Easy daily entry logging
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon
                    size={20}
                    weight="fill"
                    className="text-primary mt-0.5 shrink-0"
                  />
                  <span className="text-muted-foreground">
                    Upload diagrams & files
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon
                    size={20}
                    weight="fill"
                    className="text-primary mt-0.5 shrink-0"
                  />
                  <span className="text-muted-foreground">
                    Generate print-ready logbooks
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon
                    size={20}
                    weight="fill"
                    className="text-primary mt-0.5 shrink-0"
                  />
                  <span className="text-muted-foreground">
                    Track progress in real-time
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <ShieldCheckIcon
                size={40}
                weight="duotone"
                className="text-primary mb-2"
              />
              <CardTitle>For Supervisors</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon
                    size={20}
                    weight="fill"
                    className="text-primary mt-0.5 shrink-0"
                  />
                  <span className="text-muted-foreground">
                    Email-based review links
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon
                    size={20}
                    weight="fill"
                    className="text-primary mt-0.5 shrink-0"
                  />
                  <span className="text-muted-foreground">
                    No login required for industry supervisors
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon
                    size={20}
                    weight="fill"
                    className="text-primary mt-0.5 shrink-0"
                  />
                  <span className="text-muted-foreground">
                    Remote monitoring dashboard
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon
                    size={20}
                    weight="fill"
                    className="text-primary mt-0.5 shrink-0"
                  />
                  <span className="text-muted-foreground">
                    Timestamped feedback records
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <ChartLineUpIcon
                size={40}
                weight="duotone"
                className="text-primary mb-2"
              />
              <CardTitle>For ABU SIWES Unit</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon
                    size={20}
                    weight="fill"
                    className="text-primary mt-0.5 shrink-0"
                  />
                  <span className="text-muted-foreground">
                    Centralized student repository
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon
                    size={20}
                    weight="fill"
                    className="text-primary mt-0.5 shrink-0"
                  />
                  <span className="text-muted-foreground">
                    Automated workflows
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon
                    size={20}
                    weight="fill"
                    className="text-primary mt-0.5 shrink-0"
                  />
                  <span className="text-muted-foreground">
                    Compliance & audit reports
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon
                    size={20}
                    weight="fill"
                    className="text-primary mt-0.5 shrink-0"
                  />
                  <span className="text-muted-foreground">
                    Reduced administrative overhead
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* CTA Section */}
      <Section className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Ready to Go Digital?
          </h2>
          <p className="max-w-2xl text-lg opacity-90">
            Contact your SIWES unit coordinator to get onboarded to SLIMS.
            Already registered? Sign in to access your digital logbook.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/auth">
              <Button size="lg" variant="secondary">
                Sign In to SLIMS
              </Button>
            </Link>
            <Link href="/help">
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground text-primary-foreground bg-primary hover:bg-primary-foreground"
              >
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
