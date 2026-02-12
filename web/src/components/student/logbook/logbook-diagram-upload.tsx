"use client";

import { ImageIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUploadDiagram, type WeekData } from "@/hooks/use-student-logbook";

interface LogbookDiagramUploadProps {
  week: WeekData;
  weekId: string;
}

export function LogbookDiagramUpload({
  week,
  weekId,
}: LogbookDiagramUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [diagramCaption, setDiagramCaption] = useState("");
  const uploadDiagramMutation = useUploadDiagram(weekId);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      // Validate file size (5MB to match server limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be 5MB or less");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadDiagram = () => {
    if (!selectedFile) {
      toast.error("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    if (diagramCaption) {
      formData.append("caption", diagramCaption);
    }

    uploadDiagramMutation.mutate(formData, {
      onSuccess: () => {
        setSelectedFile(null);
        setDiagramCaption("");
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Weekly Diagram
        </CardTitle>
        <CardDescription>
          Upload a technical diagram for this week (optional)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {week.diagram ? (
          <div className="space-y-4">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
              <Image
                src={week.diagram.url}
                alt={week.diagram.caption || `Week ${week.weekNumber} diagram`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={false}
              />
            </div>
            {week.diagram.caption && (
              <p className="text-muted-foreground text-sm">
                {week.diagram.caption}
              </p>
            )}
          </div>
        ) : (
          <>
            {!week.isLocked && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="diagram">Select Image</Label>
                  <input
                    id="diagram"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
                  />
                  {selectedFile && (
                    <p className="text-muted-foreground text-xs">
                      Selected: {selectedFile.name} (
                      {(selectedFile.size / 1024).toFixed(2)} KB)
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="caption">Caption (Optional)</Label>
                  <Textarea
                    id="caption"
                    value={diagramCaption}
                    onChange={(e) => setDiagramCaption(e.target.value)}
                    placeholder="Add a description for your diagram..."
                    rows={2}
                    maxLength={500}
                  />
                </div>

                <Button
                  onClick={handleUploadDiagram}
                  disabled={!selectedFile || uploadDiagramMutation.isPending}
                >
                  <ImageIcon className="mr-1 h-4 w-4" />
                  {uploadDiagramMutation.isPending
                    ? "Uploading..."
                    : "Upload Diagram"}
                </Button>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
