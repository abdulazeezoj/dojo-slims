import type { Metadata } from "next";

import {
  AssignmentsHeader,
  AssignmentsList,
  AssignmentFormDialog,
  AutoAssignDialog,
} from "@/components/admin/assignments";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Assignments | SIWES Admin Portal",
  description: "Manage student-supervisor assignments",
};

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center justify-between">
        <AssignmentsHeader />
        <div className="flex gap-2">
          <AutoAssignDialog />
          <AssignmentFormDialog />
        </div>
      </div>
      <Card>
        <CardContent className="pt-6">
          <AssignmentsList />
        </CardContent>
      </Card>
    </div>
  );
}
