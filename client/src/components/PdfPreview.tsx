import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { Document, Page } from "react-pdf";
import { PDFDocument, StandardFonts } from "pdf-lib";
import type { InvoiceData } from "../types";

interface PdfPreviewProps {
  invoiceData: InvoiceData;
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceData>>;
}

export const PdfPreview: React.FC<PdfPreviewProps> = ({
  invoiceData,
  setInvoiceData,
}) => {
  const [_numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, _setPageNumber] = useState(1);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [pageDimensions, setPageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
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

  // Initialize page dimensions
  useEffect(() => {
    const initializePageDimensions = async () => {
      try {
        const tempDoc = await PDFDocument.create();
        const { width, height } = tempDoc.addPage().getSize();
        setPageDimensions({ width, height });
      } catch (err) {
        console.error("Failed to initialize page dimensions:", err);
        setError("ページの初期化に失敗しました");
      }
    };

    initializePageDimensions();
  }, []);

  // Generate PDF bytes
  const generatePdfBytes = useCallback(async () => {
    if (!pageDimensions) return;

    setError(null);

    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontSize = 16;

      let y = height - 50;
      page.drawText("Invoice", { x: 50, y, size: 40, font });
      y -= 60;

      page.drawText(`To: ${invoiceData.to || ""}`, {
        x: 50,
        y,
        size: fontSize,
        font,
      });
      y -= 25;
      page.drawText(`From: ${invoiceData.from || ""}`, {
        x: 50,
        y,
        size: fontSize,
        font,
      });
      y -= 50;

      // Position items below the new interactive headers
      y = height - 225;

      let total = 0;
      if (invoiceData.items && Array.isArray(invoiceData.items)) {
        invoiceData.items.forEach((item) => {
          page.drawText(item.description || "", {
            x: 50,
            y,
            size: fontSize,
            font,
          });
          page.drawText(`$${(item.amount || 0).toFixed(2)}`, {
            x: width - 150,
            y,
            size: fontSize,
            font,
          });
          y -= 25;
          total += item.amount || 0;
        });
      }

      y -= 25;
      page.drawText(`Total: $${total.toFixed(2)}`, {
        x: width - 150,
        y,
        size: fontSize,
        font,
      });

      // Custom texts are rendered as HTML overlays, not drawn on the canvas

      const bytes = await pdfDoc.save();
      setPdfBytesForDisplay(bytes);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      setError("PDFの生成に失敗しました");
    }
  }, [invoiceData, pageDimensions]);

  // Debounce PDF generation to improve performance
  useEffect(() => {
    const handler = setTimeout(() => {
      generatePdfBytes();
    }, 300); // 300ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [generatePdfBytes]);

  // Container width observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) {
        const newWidth = entries[0].contentRect.width;
        if (newWidth > 0) {
          setContainerWidth(newWidth);
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.unobserve(container);
    };
  }, []);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setError(null); // Clear error on successful load
  };

  const onDocumentLoadError = (error: Error) => {
    console.error("PDF load error:", error);
    setError("PDFの読み込みに失敗しました");
  };

  const handleTextEditChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (editingText) {
      const newCustomTexts = [...(invoiceData.customTexts || [])];
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
    if (event.currentTarget && pageDimensions && containerWidth > 0) {
      const rect = event.currentTarget.getBoundingClientRect();
      const displayX = event.clientX - rect.left;
      const displayY = event.clientY - rect.top;

      const scale = pageDimensions.width / containerWidth;
      const x = displayX * scale;
      const y = displayY * scale;

      console.log("Clicked at (display):", displayX, displayY);
      console.log("Converted to (original PDF):", x, y);

      const newCustomTexts = [
        ...(invoiceData.customTexts || []),
        { x, y, content: "新しいテキスト" },
      ];
      setInvoiceData({ ...invoiceData, customTexts: newCustomTexts });
    }
  };

  const displayScale =
    pageDimensions && containerWidth > 0
      ? containerWidth / pageDimensions.width
      : 1;

  const pdfFile = useMemo(() => {
    if (!pdfBytesForDisplay) return null;
    return { data: pdfBytesForDisplay };
  }, [pdfBytesForDisplay]);

  if (error) {
    return (
      <div className="w-full h-[1000px] bg-gray-200 rounded-lg flex justify-center items-center">
        <div className="text-red-500 text-center">
          <p>{error}</p>
          <button
            onClick={() => {
              setError(null);
              generatePdfBytes();
            }}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full h-[1000px] bg-gray-200 rounded-lg flex justify-center items-start overflow-auto"
      ref={containerRef}
    >
      <div className="relative">
        {pdfFile && containerWidth > 0 ? (
          <Document
            file={pdfFile}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading="PDFを読み込んでいます..."
          >
            <Page pageNumber={pageNumber} width={containerWidth} />
          </Document>
        ) : (
          <div className="flex justify-center items-center h-full">
            <p>PDFプレビューを準備しています...</p>
          </div>
        )}

        {/* Overlay for editable text fields */}
        {pdfFile &&
          invoiceData.customTexts?.map((textBlock, index) => (
            <div
              key={index}
              style={{
                position: "absolute",
                left: textBlock.x * displayScale,
                top: textBlock.y * displayScale,
                cursor: "text",
                border:
                  editingText?.index === index ? "1px solid blue" : "none",
                zIndex: 10,
              }}
              onClick={(e) => {
                e.stopPropagation();
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

        {/* Transparent overlay for adding new text */}
        {!editingText && pdfFile && containerWidth > 0 && (
          <div
            className="absolute inset-0 cursor-text"
            onClick={handleCanvasClick}
            style={{ zIndex: 5 }}
          ></div>
        )}
      </div>
    </div>
  );
};
