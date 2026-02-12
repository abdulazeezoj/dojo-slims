import type { Metadata } from "next";

import {
  SchoolSupervisorsHeader,
  SchoolSupervisorsList,
  SchoolSupervisorFormDialog,
  SchoolSupervisorBulkUploadDialog,
} from "@/components/admin/school-supervisors";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "School Supervisors | SIWES Admin Portal",
  description: "Manage school supervisors",
};

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center justify-between">
        <SchoolSupervisorsHeader />
        <div className="flex gap-2">
          <SchoolSupervisorBulkUploadDialog />
          <SchoolSupervisorFormDialog />
        </div>
      </div>
      <Card>
        <CardContent className="pt-6">
          <SchoolSupervisorsList />
        </CardContent>
      </Card>
    </div>
  );
}
