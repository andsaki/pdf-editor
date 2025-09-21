import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { Document, Page } from "react-pdf";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { InvoiceData, TableItem } from "../types";
import { Rnd } from "react-rnd";

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

  const [editingCell, setEditingCell] = useState<{
    tableIndex: number;
    rowIndex: number;
    cellIndex: number;
    content: string;
  } | null>(null);

  // 表示用のPDFバイトを生成
  const [pdfBytesForDisplay, setPdfBytesForDisplay] =
    useState<Uint8Array | null>(null);

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

  const handleTableChange = (
    index: number,
    pos: { x: number; y: number },
    size: { width: string | number; height: string | number }
  ) => {
    const newTables = [...(invoiceData.tables || [])];
    newTables[index] = {
      ...newTables[index],
      x: pos.x / displayScale,
      y: pos.y / displayScale,
      width: parseFloat(size.width.toString()),
      height: parseFloat(size.height.toString()),
    };
    setInvoiceData((prev) => ({ ...prev, tables: newTables }));
  };

  const handleTableCellChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (editingCell) {
      const newTables = [...(invoiceData.tables || [])];
      const newTable = { ...newTables[editingCell.tableIndex] };
      const newTableData = [...newTable.data];
      const newRow = [...newTableData[editingCell.rowIndex]];
      newRow[editingCell.cellIndex] = event.target.value;
      newTableData[editingCell.rowIndex] = newRow;
      newTable.data = newTableData;
      newTables[editingCell.tableIndex] = newTable;

      setInvoiceData({ ...invoiceData, tables: newTables });
      setEditingCell({ ...editingCell, content: event.target.value });
    }
  };

  const handleTableCellBlur = () => {
    setEditingCell(null);
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
              className="cursor-grab"
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
              className="cursor-grab"
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

        {/* ドラッグ/リサイズ可能なテーブルのオーバーレイ */}
        {pdfFile &&
          invoiceData.tables?.map((table, index) => (
            <Rnd
              key={table.id}
              className="cursor-grab"
              style={{ border: "1px dashed green", zIndex: 15 }}
              size={{
                width: table.width * displayScale,
                height: table.height * displayScale,
              }}
              position={{
                x: table.x * displayScale,
                y: table.y * displayScale,
              }}
              onDragStop={(_e, d) => {
                const newSize = { width: table.width, height: table.height };
                handleTableChange(index, { x: d.x, y: d.y }, newSize);
              }}
              onResizeStop={(_e, _direction, ref, _delta, position) => {
                handleTableChange(index, position, {
                  width: ref.style.width,
                  height: ref.style.height,
                });
              }}
            >
              <div style={{ width: "100%", height: "100%", backgroundColor: "rgba(0, 255, 0, 0.1)", overflow: "hidden" }}>
                <table style={{ width: "100%", height: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    {table.data.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => {
                          const isEditing = editingCell &&
                            editingCell.tableIndex === index &&
                            editingCell.rowIndex === rowIndex &&
                            editingCell.cellIndex === cellIndex;

                          return (
                            <td
                              key={cellIndex}
                              style={{ border: "1px solid #ccc", padding: "5px", fontSize: `${12 * displayScale}px` }}
                              onClick={() => {
                                setEditingCell({
                                  tableIndex: index,
                                  rowIndex,
                                  cellIndex,
                                  content: cell,
                                });
                              }}
                            >
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editingCell.content}
                                  onChange={handleTableCellChange}
                                  onBlur={handleTableCellBlur}
                                  autoFocus
                                  style={{ width: "100%", border: "none", background: "transparent", outline: "none" }}
                                />
                              ) : (
                                cell
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Rnd>
          ))}
      </div>
    </div>
  );
};
