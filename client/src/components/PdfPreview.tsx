import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { Document, Page } from "react-pdf";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { InvoiceData } from "../types";
import { Rnd } from "react-rnd";

interface PdfPreviewProps {
  invoiceData: InvoiceData;
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceData>>;
  activeTool: "select" | "text";
  setActiveTool: React.Dispatch<React.SetStateAction<"select" | "text">>;
}

export const PdfPreview: React.FC<PdfPreviewProps> = ({
  invoiceData,
  setInvoiceData,
  activeTool,
  setActiveTool,
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

  // 表示用のPDFバイトを生成
  const [pdfBytesForDisplay, setPdfBytesForDisplay] =
    useState<Uint8Array | null>(null);

  useEffect(() => {
    console.log("PdfPreview activeTool:", activeTool);
  }, [activeTool]);

  // ツールのキーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement &&
        ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)
      ) {
        return; // ユーザーが入力中の場合はツールを切り替えない
      }
      if (e.key.toLowerCase() === "t") {
        e.preventDefault();
        setActiveTool("text");
      } else if (e.key.toLowerCase() === "v") {
        e.preventDefault();
        setActiveTool("select");
      } else if (e.key === "Escape") {
        setActiveTool("select");
        setEditingText(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // ページの寸法を初期化
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

  // PDFバイトを生成
  const generatePdfBytes = useCallback(async () => {
    if (!pageDimensions) return;

    setError(null);

    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontSize = 12;
      const padding = 5;

      let y = height - 50;
      page.drawText("Invoice", { x: 50, y, size: 24, font: boldFont });
      y -= 60;



      // テーブル描画ロジック
      const tableTop = y;
      const tableLeft = 50;
      const tableRight = width - 50;
      const descriptionColWidth = 350;
      const rowHeight = 25;

      // ヘッダーを描画
      page.drawRectangle({
        x: tableLeft,
        y: tableTop - rowHeight,
        width: tableRight - tableLeft,
        height: rowHeight,
        color: rgb(0.9, 0.9, 0.9),
      });
      page.drawText("Description", {
        x: tableLeft + padding,
        y: tableTop - 18,
        size: fontSize,
        font: boldFont,
      });
      page.drawText("Amount", {
        x: tableLeft + descriptionColWidth + padding,
        y: tableTop - 18,
        size: fontSize,
        font: boldFont,
      });
      y = tableTop - rowHeight;

      let total = 0;
      // 行を描画
      if (invoiceData.items && Array.isArray(invoiceData.items)) {
        invoiceData.items.forEach((item) => {
          const itemDescription = item.description || "";
          const itemAmount = `$${(item.amount || 0).toFixed(2)}`;

          page.drawText(itemDescription, {
            x: tableLeft + padding,
            y: y - 18,
            size: fontSize,
            font,
          });
          page.drawText(itemAmount, {
            x: tableLeft + descriptionColWidth + padding,
            y: y - 18,
            size: fontSize,
            font,
          });

          y -= rowHeight;
          total += item.amount || 0;
        });
      }

      // テーブルの罫線を描画
      const tableBottom = y;
      page.drawRectangle({
        // 外枠
        x: tableLeft,
        y: tableBottom,
        width: tableRight - tableLeft,
        height: tableTop - tableBottom,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });
      page.drawLine({
        // 垂直線
        start: { x: tableLeft + descriptionColWidth, y: tableTop },
        end: { x: tableLeft + descriptionColWidth, y: tableBottom },
        thickness: 1,
        color: rgb(0, 0, 0),
      });

      page.drawText(`Total: $${total.toFixed(2)}`, {
        x: width - 150,
        y: 100, // ページ下部に配置
        size: 16,
        font: boldFont,
      });

      // 画像を埋め込んで描画
      if (invoiceData.images && Array.isArray(invoiceData.images)) {
        for (const image of invoiceData.images) {
          try {
            const imageBytes = image.data.startsWith("data:image/jpeg")
              ? await pdfDoc.embedJpg(image.data)
              : await pdfDoc.embedPng(image.data);

            const pdfY = height - image.y - image.height;

            page.drawImage(imageBytes, {
              x: image.x,
              y: pdfY,
              width: image.width,
              height: image.height,
            });
          } catch (imgErr) {
            console.error("Failed to embed image:", imgErr);
          }
        }
      }

      const bytes = await pdfDoc.save();
      setPdfBytesForDisplay(bytes);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      setError("PDFの生成に失敗しました");
    }
  }, [invoiceData, pageDimensions]);

  // パフォーマンス向上のためPDF生成をデバウンス
  useEffect(() => {
    const handler = setTimeout(() => {
      generatePdfBytes();
    }, 300); // 300msの遅延

    return () => {
      clearTimeout(handler);
    };
  }, [generatePdfBytes]);

  // コンテナ幅のオブザーバー
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
    setError(null); // 読み込み成功時にエラーをクリア
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

  const handleImageChange = (
    index: number,
    pos: { x: number; y: number },
    size: { width: string | number; height: string | number }
  ) => {
    const newImages = [...(invoiceData.images || [])];
    newImages[index] = {
      ...newImages[index],
      x: pos.x / displayScale,
      y: pos.y / displayScale,
      width: parseFloat(size.width.toString()),
      height: parseFloat(size.height.toString()),
    };
    setInvoiceData((prev) => ({ ...prev, images: newImages }));
  };

  const handleAddTextObject = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.currentTarget && pageDimensions && containerWidth > 0) {
      const rect = event.currentTarget.getBoundingClientRect();
      const displayX = event.clientX - rect.left;
      const displayY = event.clientY - rect.top;

      const scale = pageDimensions.width / containerWidth;
      const x = displayX * scale;
      const y = displayY * scale;

      const newCustomTexts = [
        ...(invoiceData.customTexts || []),
        { id: crypto.randomUUID(), x, y, content: "新しいテキスト" },
      ];
      setInvoiceData({ ...invoiceData, customTexts: newCustomTexts });
      setActiveTool("select"); // 選択ツールに戻す
    }
  };

  const displayScale =
    pageDimensions && containerWidth > 0
      ? containerWidth / pageDimensions.width
      : 1;

  const pdfFile = useMemo(() => {
    if (!pdfBytesForDisplay) return null;
    return { data: pdfBytesForDisplay.slice(0) };
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
      className="w-full h-full bg-gray-100 rounded-lg p-4 flex justify-center items-start overflow-auto"
      ref={containerRef}
    >
      <div
        className="relative shadow-lg"
        style={{
          width: pageDimensions ? pageDimensions.width * displayScale : 0,
          height: pageDimensions ? pageDimensions.height * displayScale : 0,
        }}
      >
        <div style={{ position: "absolute", zIndex: 1 }}>
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
        </div>

        {/* 編集可能なテキストフィールドのオーバーレイ */}
        {pdfFile &&
          invoiceData.customTexts?.map((textBlock, index) => (
            <Rnd
              key={textBlock.id}
              className={activeTool === "select" ? "cursor-grab" : ""}
              style={{
                border:
                  editingText?.index === index
                    ? "1px solid blue"
                    : "1px dashed transparent",
                zIndex: 10,
              }}
              position={{
                x: textBlock.x * displayScale,
                y: textBlock.y * displayScale,
              }}
              onDragStop={(_e, d) => {
                const newCustomTexts = [...(invoiceData.customTexts || [])];
                newCustomTexts[index] = {
                  ...newCustomTexts[index],
                  x: d.x / displayScale,
                  y: d.y / displayScale,
                };
                setInvoiceData({ ...invoiceData, customTexts: newCustomTexts });
              }}
              onClick={(e: React.MouseEvent) => {
                console.log("text overlay clicked");
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
                    background: "rgba(255, 255, 255, 0.8)",
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
            </Rnd>
          ))}

        {/* ドラッグ/リサイズ可能な画像のオーバーレイ */}
        {pdfFile &&
          invoiceData.images?.map((image, index) => (
            <Rnd
              key={image.id}
              className={activeTool === "select" ? "cursor-grab" : ""}
              style={{ border: "1px dashed gray", zIndex: 15 }}
              size={{
                width: image.width * displayScale,
                height: image.height * displayScale,
              }}
              position={{
                x: image.x * displayScale,
                y: image.y * displayScale,
              }}
              onDragStop={(_e, d) => {
                console.log("onDragStop", d);
                const newSize = { width: image.width, height: image.height };
                handleImageChange(index, { x: d.x, y: d.y }, newSize);
              }}
              onResizeStop={(_e, _direction, ref, _delta, position) => {
                console.log("onResizeStop", position);
                handleImageChange(index, position, {
                  width: ref.style.width,
                  height: ref.style.height,
                });
              }}
            >
              <img
                src={image.data}
                style={{ width: "100%", height: "100%", pointerEvents: "none" }}
                alt={`invoice-image-${index}`}
              />
            </Rnd>
          ))}

        {/* 新しいテキストを追加するための透明なオーバーレイ */}
        {activeTool === "text" &&
          !editingText &&
          pdfFile &&
          containerWidth > 0 && (
            <div
              className="absolute inset-0 cursor-text"
              onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                console.log("add text overlay clicked");
                handleAddTextObject(e);
              }}
              style={{ zIndex: 20 }}
            ></div>
          )}
      </div>
    </div>
  );
};
