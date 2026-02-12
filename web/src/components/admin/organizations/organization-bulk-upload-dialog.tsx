"use client";

import { DownloadIcon, FileXls, UploadIcon } from "@phosphor-icons/react";
import { useState, useRef } from "react";
import * as XLSX from "xlsx";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useBulkUploadOrganizations } from "@/hooks/use-admin-organizations";
import type { CreateOrganization } from "@/schemas";

interface BulkUploadDialogProps {
  trigger?: React.ReactNode;
}

export function OrganizationBulkUploadDialog({
  trigger,
}: BulkUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<{
    successful: number;
    failed: number;
    errors: Array<{ row: number; error: string }>;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bulkUploadMutation = useBulkUploadOrganizations();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleDownloadTemplate = () => {
    const template = [
      {
        name: "Tech Solutions Ltd",
        address: "123 Main Street",
        city: "Lagos",
        state: "Lagos",
        phone: "+234 xxx xxx xxxx",
        email: "info@techsolutions.com",
      },
      {
        name: "ABC Manufacturing Co",
        address: "456 Industrial Avenue",
        city: "Ibadan",
        state: "Oyo",
        phone: "+234 yyy yyy yyyy",
        email: "contact@abcmfg.com",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Organizations");
    XLSX.writeFile(wb, "organizations_template.xlsx");
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      return;
    }

    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const organizations: CreateOrganization[] = jsonData.map(
        (row: Record<string, unknown>) => ({
          name: String(row.name || "").trim(),
          address: String(row.address || "").trim(),
          city: String(row.city || "").trim(),
          state: String(row.state || "").trim(),
          phone: String(row.phone || "").trim(),
          email: row.email ? String(row.email).trim() : undefined,
        }),
      );

      const result = await bulkUploadMutation.mutateAsync(organizations);
      setUploadResult(result);

      if (result.failed === 0) {
        setTimeout(() => {
          setOpen(false);
          setSelectedFile(null);
          setUploadResult(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }, 2000);
      }
    } catch (error) {
      console.error("Error processing file:", error);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedFile(null);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      {trigger ? (
        <DialogTrigger render={trigger as React.ReactElement} />
      ) : (
        <DialogTrigger
          render={
            <Button variant="outline">
              <UploadIcon className="mr-2 h-4 w-4" />
              Bulk Upload
            </Button>
          }
        />
      )}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Upload Organizations</DialogTitle>
          <DialogDescription>
            Upload an Excel file with organization data. Download the template
            to see the required format.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadTemplate}
            >
              <DownloadIcon className="mr-2 h-4 w-4" />
              Download Template
            </Button>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="file-upload"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Select Excel File
            </label>
            <input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {selectedFile && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileXls className="h-4 w-4" />
                <span>{selectedFile.name}</span>
              </div>
            )}
          </div>

          {uploadResult && (
            <Alert
              variant={uploadResult.failed > 0 ? "destructive" : "default"}
            >
              <AlertDescription>
                <div className="space-y-2">
                  <p>
                    <strong>Upload completed:</strong> {uploadResult.successful}{" "}
                    successful, {uploadResult.failed} failed
                  </p>
                  {uploadResult.errors.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="font-medium">Errors:</p>
                      <div className="max-h-40 overflow-y-auto">
                        {uploadResult.errors.map((error, idx) => (
                          <p key={idx} className="text-sm">
                            Row {error.row}: {error.error}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="rounded-md bg-muted p-4 text-sm">
            <p className="font-medium mb-2">Required columns:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>name</strong>: Organization name (required)
              </li>
              <li>
                <strong>address</strong>: Street address (required)
              </li>
              <li>
                <strong>city</strong>: City name (required)
              </li>
              <li>
                <strong>state</strong>: State name (required)
              </li>
              <li>
                <strong>phone</strong>: Phone number (required)
              </li>
              <li>
                <strong>email</strong>: Email address (optional)
              </li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || bulkUploadMutation.isPending}
          >
            {bulkUploadMutation.isPending ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
