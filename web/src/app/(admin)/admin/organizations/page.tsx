import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  OrganizationBulkUploadDialog,
  OrganizationFormDialog,
  OrganizationsHeader,
  OrganizationsList,
} from "@/components/admin/organizations";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Placement Organizations | SIWES Admin Portal",
  description: "Manage placement organizations",
};

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <OrganizationsHeader />
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Organizations</CardTitle>
            <div className="flex gap-2">
              <OrganizationBulkUploadDialog />
              <OrganizationFormDialog />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <OrganizationsList />
        </CardContent>
      </Card>
    </div>
  );
}
