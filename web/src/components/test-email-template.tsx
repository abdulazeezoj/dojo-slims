"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const emailTemplates = [
  { value: "magic-link", label: "Magic Link" },
  { value: "welcome-account", label: "Welcome Account" },
  { value: "password-reset", label: "Password Reset" },
  { value: "password-changed", label: "Password Changed" },
  {
    value: "session-enrollment-student",
    label: "Session Enrollment - Student",
  },
  {
    value: "session-enrollment-supervisor",
    label: "Session Enrollment - Supervisor",
  },
  {
    value: "student-supervisor-assigned",
    label: "Student - Supervisor Assigned",
  },
  {
    value: "school-supervisor-assigned",
    label: "School Supervisor - Student Assigned",
  },
  {
    value: "industry-supervisor-linked",
    label: "Industry Supervisor - Student Linked",
  },
  {
    value: "review-request-industry",
    label: "Review Request - Industry Supervisor",
  },
  {
    value: "review-request-final-industry",
    label: "Final Review Request - Industry Supervisor",
  },
  {
    value: "review-request-final-school",
    label: "Final Review Request - School Supervisor",
  },
  {
    value: "comment-received-student",
    label: "Comment Received - Student",
  },
  { value: "week-locked-notification", label: "Week Locked Notification" },
];

export function TestEmailTemplate() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    emailTemplates[0].value,
  );

  const previewUrl = `/api/test-emails/${selectedTemplate}`;

  return (
    <div className="container mx-auto min-h-screen p-4 py-8">
      <Card className="mx-auto max-w-6xl">
        <CardHeader>
          <CardTitle>Email Template Preview</CardTitle>
          <CardDescription>
            Preview email templates with sample data in development mode
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="template-select">Select Email Template</Label>
            <Select
              value={selectedTemplate}
              onValueChange={(value) => value && setSelectedTemplate(value)}
            >
              <SelectTrigger id="template-select">
                <SelectValue placeholder="Choose a template" />
              </SelectTrigger>
              <SelectContent>
                {emailTemplates.map((template) => (
                  <SelectItem key={template.value} value={template.value}>
                    {template.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button
              variant="default"
              nativeButton={false}
              render={
                <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                  Open in New Tab
                </a>
              }
            />
            <Button
              variant="outline"
              onClick={() => {
                const iframe = document.getElementById(
                  "email-preview",
                ) as HTMLIFrameElement;
                if (iframe) {
                  iframe.src = iframe.src; // Reload iframe
                }
              }}
              nativeButton={false}
              render={<a>Refresh Preview</a>}
            />
          </div>

          <div className="border rounded-lg overflow-hidden">
            <iframe
              id="email-preview"
              src={previewUrl}
              className="w-full h-150 bg-white"
              title="Email Template Preview"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
