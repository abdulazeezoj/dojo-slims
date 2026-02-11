import { PdfPreviewData } from "./pdf-preview-data";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "PDF Preview",
  description: "Preview and download your ITF-compliant SIWES logbook PDF.",
};

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <PdfPreviewData />
    </div>
  );
}
