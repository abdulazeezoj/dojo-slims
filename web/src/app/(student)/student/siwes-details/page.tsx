
import { SiwesDetailsData } from "./siwes-details-data";
import { SiwesDetailsHeader } from "./siwes-details-header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SIWES Details",
  description: "Enter and manage your SIWES placement and supervisor details.",
};

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <SiwesDetailsHeader />
      <SiwesDetailsData />
    </div>
  );
}
