"use client";

import {
  DownloadIcon,
  FilePdfIcon,
  InfoIcon,
  PrinterIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardData } from "@/hooks/use-student-dashboard";

export function PdfPreviewData() {
  const searchParams = useSearchParams();
  const { data: dashboardData, isLoading, error } = useDashboardData();

  if (isLoading) {
    return <PdfPreviewSkeleton />;
  }

  if (error) {
    // Critical data - bubble to error boundary
    throw error;
  }

  const activeSession = dashboardData?.activeSession;

  if (!activeSession) {
    return <NoActiveSession />;
  }

  const sessionId = searchParams.get("sessionId") || activeSession.id;
  const pdfUrl = `/api/student/logbook/pdf?sessionId=${sessionId}`;

  return <PdfViewer pdfUrl={pdfUrl} sessionName={activeSession.name} />;
}

function NoActiveSession() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
      <WarningCircleIcon className="h-12 w-12 text-muted-foreground" />
      <h2 className="text-xl font-semibold">No Active Session</h2>
      <p className="text-muted-foreground text-center">
        You don&apos;t have an active SIWES session. Please contact the SIWES
        Unit.
      </p>
    </div>
  );
}

interface PdfViewerProps {
  pdfUrl: string;
  sessionName: string;
}

function PdfViewer({ pdfUrl, sessionName }: PdfViewerProps) {
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfError, setPdfError] = useState(false);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `SIWES-Logbook-${sessionName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("PDF download started");
  };

  const handlePrint = () => {
    const iframe = document.querySelector("iframe");
    if (iframe?.contentWindow) {
      iframe.contentWindow.print();
    } else {
      window.open(pdfUrl, "_blank");
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">PDF Preview</h1>
          <p className="text-muted-foreground">
            Preview and download your ITF-compliant SIWES logbook
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            disabled={pdfLoading || pdfError}
          >
            <PrinterIcon className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button
            size="sm"
            onClick={handleDownload}
            disabled={pdfLoading || pdfError}
          >
            <DownloadIcon className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* ITF Format Info */}
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>ITF-Compliant Format</AlertTitle>
        <AlertDescription>
          This logbook is formatted according to the Industrial Training Fund
          (ITF) standards for SIWES documentation. It includes all required
          sections, supervisor comments, and weekly entries.
        </AlertDescription>
      </Alert>

      {/* PDF Viewer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FilePdfIcon className="h-5 w-5" />
            Logbook for {sessionName}
          </CardTitle>
          <CardDescription>
            Review your logbook before downloading or printing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pdfError ? (
            <div className="flex flex-col items-center justify-center gap-4 py-12">
              <WarningCircleIcon className="h-12 w-12 text-destructive" />
              <h3 className="text-lg font-semibold">Failed to Load PDF</h3>
              <p className="text-muted-foreground text-center text-sm">
                There was an error loading your logbook PDF. This may happen if
                you haven&apos;t completed your SIWES details or have no logbook
                entries.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setPdfError(false);
                  setPdfLoading(true);
                }}
              >
                Try Again
              </Button>
            </div>
          ) : (
            <div className="relative">
              {pdfLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                  <div className="text-center">
                    <Skeleton className="mx-auto mb-4 h-12 w-12" />
                    <p className="text-sm text-muted-foreground">
                      Loading PDF...
                    </p>
                  </div>
                </div>
              )}
              <iframe
                src={pdfUrl}
                className="h-200 w-full rounded-lg border"
                title="SIWES Logbook PDF Preview"
                onLoad={() => setPdfLoading(false)}
                onError={() => {
                  setPdfLoading(false);
                  setPdfError(true);
                  toast.error(
                    "Failed to load PDF. Please ensure you have completed your SIWES details and have logbook entries.",
                  );
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Before Printing</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>
                Ensure all weekly entries are complete and reviewed by your
                supervisors
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>
                Verify that your SIWES details (organization, supervisor
                information) are accurate
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>
                Print on A4 paper and bind according to your department&apos;s
                requirements
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>
                Submit the physical logbook to the SIWES Unit before the
                deadline
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </>
  );
}

export function PdfPreviewSkeleton() {
  return (
    <>
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-36" />
        </div>
      </div>

      {/* Alert skeleton */}
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>

      {/* PDF viewer skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-80" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>

      {/* Info skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
