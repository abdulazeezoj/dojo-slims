import type { Metadata } from "next";

import {
  SessionsHeader,
  SessionsList,
  SessionFormDialog,
} from "@/components/admin/sessions";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "SIWES Sessions | SIWES Admin Portal",
  description: "Manage SIWES sessions",
};

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center justify-between">
        <SessionsHeader />
        <SessionFormDialog />
      </div>
      <Card>
        <CardContent className="pt-6">
          <SessionsList />
        </CardContent>
      </Card>
    </div>
  );
}
