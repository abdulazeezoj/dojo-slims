import type { Metadata } from "next";

import {
  StudentsHeader,
  StudentsList,
  StudentFormDialog,
  StudentBulkUploadDialog,
} from "@/components/admin/students";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Students | SIWES Admin Portal",
  description: "Manage students",
};

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center justify-between">
        <StudentsHeader />
        <div className="flex gap-2">
          <StudentBulkUploadDialog />
          <StudentFormDialog />
        </div>
      </div>
      <Card>
        <CardContent className="pt-6">
          <StudentsList />
        </CardContent>
      </Card>
    </div>
  );
}
