"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TestError() {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    throw new Error("This is a test error to preview the error.tsx UI");
  }

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Test Error Boundary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Click the button below to trigger an error and see how the error.tsx
            page looks.
          </p>
          <Button
            onClick={() => setShouldError(true)}
            variant="destructive"
            className="w-full"
          >
            Trigger Error
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
