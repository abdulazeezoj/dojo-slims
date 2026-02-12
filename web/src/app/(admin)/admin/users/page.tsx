import type { Metadata } from "next";

import {
  UsersHeader,
  UsersList,
  UserFormDialog,
} from "@/components/admin/users";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Admin Users | SIWES Admin Portal",
  description: "Manage admin users",
};

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center justify-between">
        <UsersHeader />
        <UserFormDialog />
      </div>
      <Card>
        <CardContent className="pt-6">
          <UsersList />
        </CardContent>
      </Card>
    </div>
  );
}
