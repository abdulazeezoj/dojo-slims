import type { Metadata } from "next";

import {
  DepartmentsHeader,
  DepartmentsList,
  DepartmentFormDialog,
  FacultiesList,
  FacultyFormDialog,
} from "@/components/admin/departments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "Departments & Faculties | SIWES Admin Portal",
  description: "Manage departments and faculties",
};

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <DepartmentsHeader />
      <Tabs defaultValue="departments">
        <TabsList>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="faculties">Faculties</TabsTrigger>
        </TabsList>
        <TabsContent value="departments">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Departments</CardTitle>
                <DepartmentFormDialog />
              </div>
            </CardHeader>
            <CardContent>
              <DepartmentsList />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="faculties">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Faculties</CardTitle>
                <FacultyFormDialog />
              </div>
            </CardHeader>
            <CardContent>
              <FacultiesList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
