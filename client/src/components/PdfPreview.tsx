import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { Document, Page } from "react-pdf";
import { PDFDocument, StandardFonts, ColorTypes } from "pdf-lib";
import type { InvoiceData, LayoutItem } from "../types";
import { Rnd } from "react-rnd";
import { z } from "zod";

const contentSchema = z.string().min(1, "テーブルのセルは空にできません");

interface PdfPreviewProps {
  invoiceData: InvoiceData;
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceData>>;
  selectedObjectId: string | null;
  setSelectedObjectId: React.Dispatch<React.SetStateAction<string | null>>;
}

/**
 * 請求書のプレビューを表示し、レイアウト編集のユーザー操作を処理します。
 * @param {PdfPreviewProps} props コンポーネントのプロパティ
 * @returns {JSX.Element} レンダリングされたコンポーネント
 */
export const PdfPreview: React.FC<PdfPreviewProps> = ({
  invoiceData,
  setInvoiceData,
  selectedObjectId,
  setSelectedObjectId,
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

  const [editingText, setEditingText] = useState<string | null>(null); // 現在編集中のテキストオブジェクトのID
  const [editingCell, setEditingCell] = useState<{
    itemId: string;
    rowIndex: number;
    cellIndex: number;
  } | null>(null);

  const [validationErrors, setValidationErrors] = useState<any>({});

  const [pdfBytesForDisplay, setPdfBytesForDisplay] =
    useState<Uint8Array | null>(null);

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

  /**
   * 表示用のPDFバイトを生成します。
   */
  const generatePdfBytes = useCallback(async () => {
    if (!pageDimensions) return;

    setError(null);

    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      const { height } = page.getSize();

      for (const item of invoiceData.layout) {
        if (item.type === "image") {
          try {
            const imageBytes = item.data.startsWith("data:image/jpeg")
              ? await pdfDoc.embedJpg(item.data)
              : await pdfDoc.embedPng(item.data);

            const pdfY = height - item.y - item.height;

            page.drawImage(imageBytes, {
              x: item.x,
              y: pdfY,
              width: item.width,
              height: item.height,
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

  useEffect(() => {
    const handler = setTimeout(() => {
      generatePdfBytes();
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [generatePdfBytes]);

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
    setError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error("PDF load error:", error);
    setError("PDFの読み込みに失敗しました");
  };

  /**
   * レイアウト項目を新しいプロパティで更新します。
   * @param {string} itemId 更新するアイテムのID
   * @param {function(LayoutItem): LayoutItem} updateFn 古いアイテムを受け取り、新しいアイテムを返す関数
   */
  const updateLayoutItem = (
    itemId: string,
    updateFn: (item: LayoutItem) => LayoutItem
  ) => {
    setInvoiceData((prev) => ({
      ...prev,
      layout: prev.layout.map((item) =>
        item.id === itemId ? updateFn(item) : item
      ),
    }));
  };

  /**
   * テキストアイテムのコンテンツの変更を処理します。
   * @param {string} itemId テキストアイテムのID
   * @param {string} content 新しいコンテンツ
   */
  const handleTextChange = (itemId: string, content: string) => {
    const validation = contentSchema.safeParse(content);
    if (!validation.success) {
      setValidationErrors({
        ...validationErrors,
        [itemId]: validation.error.issues[0].message,
      });
    } else {
      const newErrors = { ...validationErrors };
      delete newErrors[itemId];
      setValidationErrors(newErrors);
    }
    updateLayoutItem(itemId, (item) => {
      if (item.type === 'text') {
        return { ...item, content };
      }
      return item;
    });
  };

  /**
   * テーブルセルのコンテンツの変更を処理します。
   * @param {string} itemId テーブルアイテムのID
   * @param {number} rowIndex セルの行インデックス
   * @param {number} cellIndex セルの列インデックス
   * @param {string} content 新しいコンテンツ
   */
  const handleTableCellChange = (
    itemId: string,
    rowIndex: number,
    cellIndex: number,
    content: string
  ) => {
    const validation = contentSchema.safeParse(content);
    const errorKey = `${itemId}-${rowIndex}-${cellIndex}`;
    if (!validation.success) {
      setValidationErrors({
        ...validationErrors,
        [errorKey]: validation.error.issues[0].message,
      });
    } else {
      const newErrors = { ...validationErrors };
      delete newErrors[errorKey];
      setValidationErrors(newErrors);
    }

    updateLayoutItem(itemId, (item) => {
      if (item.type === "table") {
        const newTableData = [...item.data];
        const newRow = [...newTableData[rowIndex]];
        newRow[cellIndex] = content;
        newTableData[rowIndex] = newRow;
        return { ...item, data: newTableData };
      }
      return item;
    });
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
        onClick={() => setSelectedObjectId(null)}
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

        {pdfFile &&
          invoiceData.layout.map((item) => (
            <Rnd
              key={item.id}
              className="cursor-grab"
              style={{
                border: selectedObjectId === item.id ? "1px solid blue" : "1px dashed transparent",
                zIndex: 10,
              }}
              size={{
                width: item.width * displayScale,
                height: item.height * displayScale,
              }}
              position={{
                x: item.x * displayScale,
                y: item.y * displayScale,
              }}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                setSelectedObjectId(item.id);
              }}
              onDragStop={(_e, d) => {
                updateLayoutItem(item.id, (item) => ({
                  ...item,
                  x: d.x / displayScale,
                  y: d.y / displayScale,
                }));
              }}
              onResizeStop={(_e, _direction, ref, _delta, position) => {
                updateLayoutItem(item.id, (item) => ({
                  ...item,
                  x: position.x / displayScale,
                  y: position.y / displayScale,
                  width: parseFloat(ref.style.width) / displayScale,
                  height: parseFloat(ref.style.height) / displayScale,
                }));
              }}
            >
              {item.type === "text" &&
                (editingText === item.id ? (
                  <div>
                    <input
                      type="text"
                      value={item.content}
                      onChange={(e) =>
                        handleTextChange(item.id, e.target.value)
                      }
                      onBlur={() => setEditingText(null)}
                      autoFocus
                      style={{
                        background: "rgba(255, 255, 255, 0.8)",
                        color: "black",
                        border: "none",
                        padding: 0,
                        fontSize: `${(item.style?.fontSize || 16) * displayScale}px`,
                        fontFamily: item.style?.fontFamily || 'Helvetica',
                      }}
                      className="cursor-text"
                    />
                    {validationErrors[item.id] && (
                      <span style={{ color: "red", fontSize: "10px" }}>
                        {validationErrors[item.id]}
                      </span>
                    )}
                  </div>
                ) : (
                  <span
                    style={{
                      color: item.style?.color || "black",
                      fontSize: `${(item.style?.fontSize || 16) * displayScale}px`,
                      fontWeight: item.style?.bold ? 'bold' : 'normal',
                      fontStyle: item.style?.italic ? 'italic' : 'normal',
                      textAlign: item.style?.textAlign || 'left',
                      lineHeight: item.style?.lineHeight || 1,
                      whiteSpace: item.style?.wordWrap ? 'pre-wrap' : 'nowrap',
                      display: 'flex',
                      alignItems: item.style?.verticalAlign === 'center' ? 'center' : item.style?.verticalAlign === 'bottom' ? 'flex-end' : 'flex-start',
                      height: '100%',
                      fontFamily: item.style?.fontFamily || 'Helvetica',
                    }}
                    className="cursor-text"
                    onDoubleClick={() => setEditingText(item.id)}
                  >
                    {item.content}
                  </span>
                ))}
              {item.type === "image" && (
                <img
                  src={item.data}
                  style={{
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                  }}
                  alt={`invoice-image`}
                />
              )}
              {item.type === "table" && (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(0, 255, 0, 0.1)",
                    overflow: "hidden",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      height: "100%",
                      borderCollapse: "collapse",
                    }}
                  >
                    <tbody>
                      {item.data.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((cell, cellIndex) => {
                            const isEditing =
                              editingCell?.itemId === item.id &&
                              editingCell.rowIndex === rowIndex &&
                              editingCell.cellIndex === cellIndex;
                            const errorKey = `${item.id}-${rowIndex}-${cellIndex}`;
                            return (
                              <td
                                key={cellIndex}
                                style={{
                                  border: "1px solid #ccc",
                                  padding: "5px",
                                  fontSize: `${12 * displayScale}px`,
                                }}
                                onDoubleClick={() => {
                                  setEditingCell({
                                    itemId: item.id,
                                    rowIndex,
                                    cellIndex,
                                  });
                                }}
                              >
                                {isEditing ? (
                                  <div>
                                    <input
                                      type="text"
                                      value={cell}
                                      onChange={(e) =>
                                        handleTableCellChange(
                                          item.id,
                                          rowIndex,
                                          cellIndex,
                                          e.target.value
                                        )
                                      }
                                      onBlur={() => setEditingCell(null)}
                                      autoFocus
                                      style={{
                                        width: "100%",
                                        border: "none",
                                        background: "transparent",
                                        outline: "none",
                                      }}
                                    />
                                    {validationErrors[errorKey] && (
                                      <span
                                        style={{
                                          color: "red",
                                          fontSize: "10px",
                                        }}
                                      >
                                        {validationErrors[errorKey]}
                                      </span>
                                    )}
                                  </div>
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
              )}
            </Rnd>
          ))}
      </div>
    </div>
  );
};
