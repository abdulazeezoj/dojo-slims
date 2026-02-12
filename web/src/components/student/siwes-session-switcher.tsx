"use client";

import { CircleNotchIcon } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useSwitchSession,
  type SessionInfo,
} from "@/hooks/use-student-dashboard";

export function SiwesSessionSwitcherSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-10 w-50" />
    </div>
  );
}

interface SiwesSessionSwitcherProps {
  currentSession: SessionInfo;
  availableSessions: SessionInfo[];
}

export function SiwesSessionSwitcher({
  currentSession,
  availableSessions,
}: SiwesSessionSwitcherProps) {
  const switchSessionMutation = useSwitchSession();

  const handleSessionSwitch = (sessionId: string | null) => {
    if (!sessionId || sessionId === currentSession.id) {
      return;
    }
    switchSessionMutation.mutate({ sessionId });
  };

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium">SIWES Session:</label>
      <Select
        value={currentSession.id}
        onValueChange={handleSessionSwitch}
        disabled={switchSessionMutation.isPending}
      >
        <SelectTrigger className="w-50">
          {switchSessionMutation.isPending ? (
            <span className="flex items-center gap-2">
              <CircleNotchIcon className="h-4 w-4 animate-spin" weight="bold" />
              Switching...
            </span>
          ) : (
            <SelectValue placeholder="Select session" />
          )}
        </SelectTrigger>
        <SelectContent>
          {availableSessions.map((session) => (
            <SelectItem key={session.id} value={session.id}>
              {session.name}
              {session.status === "ACTIVE" && (
                <Badge variant="default" className="ml-2">
                  Active
                </Badge>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
