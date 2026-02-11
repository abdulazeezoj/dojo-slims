import type { Metadata } from "next";

import {
  EnrollmentsHeader,
  EnrollmentsList,
  EnrollmentFormDialog,
  BulkEnrollDialog,
} from "@/components/admin/enrollments";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Enrollment | SIWES Admin Portal",
  description: "Manage student enrollments",
};

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center justify-between">
        <EnrollmentsHeader />
        <div className="flex gap-2">
          <BulkEnrollDialog />
          <EnrollmentFormDialog />
        </div>
      </div>
      <Card>
        <CardContent className="pt-6">
          <EnrollmentsList />
        </CardContent>
      </Card>
    </div>
  );
}
