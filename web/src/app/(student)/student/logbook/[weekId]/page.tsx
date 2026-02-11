import { LogbookWeekDetail } from "@/components/student/logbook/logbook-week-detail";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { weekId: string };
}): Promise<Metadata> {
  const { weekId: _weekId } = params;
  // We could fetch the week number from API here for better SEO,
  // but for now we'll use dynamic title
  return {
    title: "Week Details",
    description:
      "View and edit your weekly SIWES entries, upload diagrams, and request reviews.",
  };
}

export default function Page({ params }: { params: { weekId: string } }) {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <LogbookWeekDetail weekId={params.weekId} />
    </div>
  );
}
