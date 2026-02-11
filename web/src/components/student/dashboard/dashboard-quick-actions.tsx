import {
  BellIcon,
  BookOpenIcon,
  FilePdfIcon,
  UserIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function DashboardQuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BellIcon className="h-5 w-5" />
          Quick Actions
        </CardTitle>
        <CardDescription>Commonly used features</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Link
            href="/student/logbook"
            className="bg-muted hover:bg-muted/80 flex items-center gap-3 rounded-lg p-3 transition-colors"
          >
            <BookOpenIcon className="h-5 w-5" />
            <div>
              <p className="font-medium">View Logbook</p>
              <p className="text-muted-foreground text-xs">
                Access your weekly entries
              </p>
            </div>
          </Link>
          <Link
            href="/student/pdf-preview"
            className="bg-muted hover:bg-muted/80 flex items-center gap-3 rounded-lg p-3 transition-colors"
          >
            <FilePdfIcon className="h-5 w-5" />
            <div>
              <p className="font-medium">Generate PDF Logbook</p>
              <p className="text-muted-foreground text-xs">
                Download ITF-compliant logbook
              </p>
            </div>
          </Link>
          <Link
            href="/student/profile"
            className="bg-muted hover:bg-muted/80 flex items-center gap-3 rounded-lg p-3 transition-colors"
          >
            <UserIcon className="h-5 w-5" />
            <div>
              <p className="font-medium">Profile Settings</p>
              <p className="text-muted-foreground text-xs">
                Update your information
              </p>
            </div>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
