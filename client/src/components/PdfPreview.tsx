import React, { useEffect, useState } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { InvoiceData } from '../types';

interface PdfPreviewProps {
  invoiceData: InvoiceData;
}

async function generatePdf(invoiceData: InvoiceData): Promise<string> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;

  let y = height - 40;
  page.drawText('Invoice', { x: 50, y, size: 30, font });
  y -= 50;

  page.drawText(`To: ${invoiceData.to}`, { x: 50, y, size: fontSize, font });
  y -= 20;
  page.drawText(`From: ${invoiceData.from}`, { x: 50, y, size: fontSize, font });
  y -= 40;

  page.drawText('Description', { x: 50, y, size: fontSize, font });
  page.drawText('Amount', { x: width - 150, y, size: fontSize, font });
  y -= 20;

  let total = 0;
  invoiceData.items.forEach(item => {
    page.drawText(item.description, { x: 50, y, size: fontSize, font });
    page.drawText(`$${item.amount.toFixed(2)}`, { x: width - 150, y, size: fontSize, font });
    y -= 20;
    total += item.amount;
  });

  y -= 20;
  page.drawText(`Total: $${total.toFixed(2)}`, { x: width - 150, y, size: fontSize, font });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
}

export const PdfPreview: React.FC<PdfPreviewProps> = ({ invoiceData }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    generatePdf(invoiceData).then(url => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
      setPdfUrl(url);
    });

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [invoiceData]);

  return (
    <div className="w-full h-full p-4 bg-gray-200 rounded-lg">
      {pdfUrl ? (
        <iframe src={pdfUrl} className="w-full h-full border-none" title="Invoice Preview" />
      ) : (
        <p>Generating preview...</p>
      )}
    </div>
  );
};
