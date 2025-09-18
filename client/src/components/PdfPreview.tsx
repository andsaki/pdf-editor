import React from "react";
import { PDFViewer } from "@react-pdf/renderer";
import { InvoiceDocument } from "./InvoiceDocument";
import type { InvoiceData } from "../types";

interface PdfPreviewProps {
  invoiceData: InvoiceData;
}

export const PdfPreview: React.FC<PdfPreviewProps> = ({ invoiceData }) => {
  return (
    <div className="w-full bg-gray-200 rounded-lg">
      <PDFViewer width="100%" height="1000px" className="border-none">
        <InvoiceDocument invoiceData={invoiceData} />
      </PDFViewer>
    </div>
  );
};
