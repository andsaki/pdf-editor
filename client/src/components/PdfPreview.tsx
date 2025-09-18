import React, { useEffect, useState, useRef, useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import type { InvoiceData } from "../types";

// Configure the PDF worker to prevent a 404 error in Vite.
// This tells react-pdf where to find its worker file.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

interface PdfPreviewProps {
  invoiceData: InvoiceData;
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceData>>;
}

export const PdfPreview: React.FC<PdfPreviewProps> = ({
  invoiceData,
  setInvoiceData,
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [pageDimensions, setPageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [editingText, setEditingText] = useState<{
    index: number;
    x: number;
    y: number;
    content: string;
  } | null>(null);

  // Generate PDF bytes for display
  const [pdfBytesForDisplay, setPdfBytesForDisplay] =
    useState<Uint8Array | null>(null);

  useEffect(() => {
    const generatePdfBytes = async () => {
      // If pageDimensions are not set, we can't calculate coordinates correctly.
      // We will set them and let the effect re-run.
      if (!pageDimensions) {
        const tempDoc = await PDFDocument.create();
        const { width, height } = tempDoc.addPage().getSize();
        setPageDimensions({ width, height });
        return; // Exit and wait for re-render with pageDimensions
      }

      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontSize = 16;

      let y = height - 50;
      page.drawText("Invoice", { x: 50, y, size: 40, font });
      y -= 60;

      page.drawText(`To: ${invoiceData.to}`, {
        x: 50,
        y,
        size: fontSize,
        font,
      });
      y -= 25;
      page.drawText(`From: ${invoiceData.from}`, {
        x: 50,
        y,
        size: fontSize,
        font,
      });
      y -= 50;

      page.drawText("Description", { x: 50, y, size: fontSize, font });
      page.drawText("Amount", { x: width - 150, y, size: fontSize, font });
      y -= 25;

      let total = 0;
      invoiceData.items.forEach((item) => {
        page.drawText(item.description, { x: 50, y, size: fontSize, font });
        page.drawText(`$${item.amount.toFixed(2)}`, {
          x: width - 150,
          y,
          size: fontSize,
          font,
        });
        y -= 25;
        total += item.amount;
      });

      y -= 25;
      page.drawText(`Total: $${total.toFixed(2)}`, {
        x: width - 150,
        y,
        size: fontSize,
        font,
      });

      // Draw custom texts (for display only, actual editing is via overlay)
      invoiceData.customTexts.forEach((textBlock) => {
        // The stored coordinates are already scaled to the original PDF size.
        // We just need to convert the Y-coordinate from top-left origin to bottom-left origin.
        const pdfY = height - textBlock.y; // height is original page height

        page.drawText(textBlock.content, {
          x: textBlock.x,
          y: pdfY,
          size: fontSize,
          font,
        });
      });

      const bytes = await pdfDoc.save();
      setPdfBytesForDisplay(bytes);
    };

    generatePdfBytes();
  }, [invoiceData, pageDimensions]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Use ResizeObserver to keep track of the container's width.
    // This is more robust than setting it once on mount.
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) {
        setContainerWidth(entries[0].contentRect.width);
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.unobserve(container);
    };
  }, []);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleTextEditChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (editingText) {
      const newCustomTexts = [...invoiceData.customTexts];
      newCustomTexts[editingText.index] = {
        ...newCustomTexts[editingText.index],
        content: event.target.value,
      };
      setInvoiceData({ ...invoiceData, customTexts: newCustomTexts });
      setEditingText({ ...editingText, content: event.target.value });
    }
  };

  const handleTextEditBlur = () => {
    setEditingText(null);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Use event.currentTarget to get the element the event listener is attached to (the overlay).
    // This ensures coordinates are relative to the PDF's rendered area, not the outer container.
    if (event.currentTarget && pageDimensions) {
      // Ensure containerWidth is valid to prevent division by zero
      if (containerWidth <= 0) {
        console.error(
          "Container width is not ready. Cannot calculate coordinates."
        );
        return;
      }
      const rect = event.currentTarget.getBoundingClientRect(); // The overlay's rect
      const displayX = event.clientX - rect.left; // X relative to the overlay
      const displayY = event.clientY - rect.top; // Y relative to the overlay

      // Calculate the scale factor between the original PDF and the displayed version
      const scale = pageDimensions.width / containerWidth;

      // Convert display coordinates to original PDF coordinates (top-left origin)
      const x = displayX * scale;
      const y = displayY * scale;

      console.log("Clicked at (display):", displayX, displayY);
      console.log("Converted to (original PDF):", x, y);

      const newCustomTexts = [
        ...invoiceData.customTexts,
        { x, y, content: "新しいテキスト" },
      ];
      setInvoiceData({ ...invoiceData, customTexts: newCustomTexts });
    }
  };

  // Calculate the scale for rendering the overlay elements
  const displayScale = pageDimensions
    ? containerWidth / pageDimensions.width
    : 1;

  // Memoize the file object to prevent unnecessary re-renders of the PDF document.
  const pdfFile = useMemo(() => {
    if (!pdfBytesForDisplay) return null;
    return { data: pdfBytesForDisplay };
  }, [pdfBytesForDisplay]);

  return (
    <div
      className="w-full h-[1000px] bg-gray-200 rounded-lg flex justify-center items-start overflow-auto"
      ref={containerRef}
    >
      <div className="relative">
        {pdfFile ? (
          <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
            <Page pageNumber={pageNumber} width={containerWidth} />
          </Document>
        ) : (
          <p>Generating PDF preview...</p>
        )}

        {/* Overlay for editable text fields */}
        {invoiceData.customTexts.map((textBlock, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              left: textBlock.x * displayScale,
              top: textBlock.y * displayScale,
              cursor: "text",
              border: editingText?.index === index ? "1px dashed blue" : "none",
            }}
            onClick={(e) => {
              e.stopPropagation(); // Prevent canvas click when clicking on text block
              setEditingText({
                index,
                x: textBlock.x,
                y: textBlock.y,
                content: textBlock.content,
              });
            }}
          >
            {editingText?.index === index ? (
              <input
                type="text"
                value={editingText.content}
                onChange={handleTextEditChange}
                onBlur={handleTextEditBlur}
                autoFocus
                style={{
                  background: "yellow",
                  color: "black",
                  border: "none",
                  padding: 0,
                  fontSize: `${16 * displayScale}px`,
                }}
                className="cursor-text"
              />
            ) : (
              <span
                style={{
                  color: "black",
                  fontSize: `${16 * displayScale}px`,
                  whiteSpace: "nowrap",
                }}
                className="cursor-text"
              >
                {textBlock.content}
              </span>
            )}
          </div>
        ))}

        {/* Transparent overlay for adding new text, only shown when not editing */}
        {!editingText && pdfFile && (
          <div
            className="absolute inset-0 cursor-text"
            onClick={handleCanvasClick}
          ></div>
        )}
      </div>
    </div>
  );
};
