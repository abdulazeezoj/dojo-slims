import { WeeklyReviewDetail } from "@/components/school-supervisor/weekly-review";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Weekly Review",
  description: "Review student's weekly activities and provide feedback.",
};

interface PageProps {
  params: Promise<{
    studentId: string;
    weekId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { studentId, weekId } = await params;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <WeeklyReviewDetail studentId={studentId} weekId={weekId} />
    </div>
  );
}
