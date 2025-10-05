import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { Document, Page } from "react-pdf";
import { PDFDocument, rgb } from "pdf-lib";
import type {
  InvoiceData,
  LayoutItem,
  ShapeItem,
  CompanyInfo,
  TableCell,
} from "../utils/types";
import { z } from "zod";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import { DraggableItem } from "./DraggableItem";
import {
  createAnnouncer,
} from "../utils/accessibility";

const textContentSchema = z.string().min(1, "テキストは空にできません");

interface PdfPreviewProps {
  invoiceData: InvoiceData;
  setLayout: React.Dispatch<React.SetStateAction<LayoutItem[]>>;
  selectedObjectId: string | null;
  onSelectObject: (id: string | null) => void;
  selectedCell: { tableId: string; rowIndex: number; cellIndex: number } | null;
  onSelectCell: (
    selection: { tableId: string; rowIndex: number; cellIndex: number } | null
  ) => void;
  variableDisplayMode: "name" | "example";
  companyInfo?: CompanyInfo;
}

interface MultiSelectionState {
  selectedIds: Set<string>;
  isMultiSelecting: boolean;
}

const getPreviewProcessedContent = (
  item: LayoutItem | TableCell,
  invoiceData: InvoiceData,
  variableDisplayMode: "name" | "example",
  companyInfo?: CompanyInfo
): string => {
  if (!item || typeof item !== "object" || !("content" in item && "contentType" in item)) {
    return "";
  }
  const { contentType, content, label } = item;

  const variableName = content.match(/{{(.*?)}}/)?.[1];
  if (!variableName) return content;

  const trimmedVariableName = variableName.trim();

  const keys = trimmedVariableName.split(".");
  const data = { form: invoiceData.form, companyInfo };

  const resolvePath = (pathKeys: string[]) => {
    let current: any = data;
    for (const key of pathKeys) {
      if (current === undefined || current === null) return undefined;
      if (typeof current === "object") {
        if (Array.isArray(current) && !isNaN(Number(key))) {
          current = current[Number(key)];
        } else if (key in current) {
          current = current[key];
        } else {
          return undefined;
        }
      } else {
        return undefined;
      }
    }
    return current;
  };

  if (variableDisplayMode === "example") {
    const objectKeys = trimmedVariableName.endsWith(".value")
      ? keys.slice(0, -1)
      : keys;
    const resolvedObject = resolvePath(objectKeys);

    if (
      resolvedObject &&
      typeof resolvedObject === "object" &&
      "label" in resolvedObject
    ) {
      if (contentType === "labeled-variable") {
        const labelText = label || "";
        const separator = labelText && !labelText.endsWith(' ') ? ' ' : '';
        return `${labelText}${separator}{{${resolvedObject.label}}}`;
      }
      return `{{${resolvedObject.label}}}`;
    }
    if (contentType === "labeled-variable") {
      const labelText = label || "";
      const separator = labelText && !labelText.endsWith(' ') ? ' ' : '';
      return `${labelText}${separator}{{${trimmedVariableName}}}`;
    }
    return `{{${trimmedVariableName}}}`;
  }

  const resolvedValue = resolvePath(keys);

  if (resolvedValue !== undefined) {
    if (contentType === "labeled-variable") {
      const labelText = label || "";
      const separator = labelText && !labelText.endsWith(' ') ? ' ' : '';
      return `${labelText}${separator}${resolvedValue}`;
    }
    return String(resolvedValue);
  }

  return `{{undefined}}`;
};

export const PdfPreviewDndKit: React.FC<PdfPreviewProps> = ({
  invoiceData,
  setLayout,
  selectedObjectId,
  onSelectObject,
  selectedCell,
  onSelectCell,
  variableDisplayMode,
  companyInfo,
}) => {
  const [pageNumber] = useState(1);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [containerHeight, setContainerHeight] = useState<number>(0);
  const [pageDimensions, setPageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [editingText, setEditingText] = useState<string | null>(null);

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const [pdfBytesForDisplay, setPdfBytesForDisplay] =
    useState<Uint8Array | null>(null);

  const [announcement, setAnnouncement] = useState<string>("");

  // 複数選択の状態管理
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isMultiSelecting, setIsMultiSelecting] = useState(false);

  // dnd-kit sensors (マウスのみ、キーボードは独自実装)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

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
            const imageBytes = item.src.startsWith("data:image/jpeg")
              ? await pdfDoc.embedJpg(item.src)
              : await pdfDoc.embedPng(item.src);

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

        if (item.type === "shape") {
          const pdfY = height - item.y - item.height;
          const shapeItem = item as ShapeItem;

          const hexToRgb = (hex: string) => {
            const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
            if (!match) return undefined;
            return rgb(
              parseInt(match[1], 16) / 255,
              parseInt(match[2], 16) / 255,
              parseInt(match[3], 16) / 255
            );
          };

          const bgColor = shapeItem.style?.backgroundColor ? hexToRgb(shapeItem.style.backgroundColor) : undefined;
          const borderColor = shapeItem.style?.borderColor ? hexToRgb(shapeItem.style.borderColor) : undefined;

          if (shapeItem.shapeType === "h-line") {
            if (borderColor) {
              page.drawLine({
                start: { x: item.x, y: pdfY + item.height / 2 },
                end: { x: item.x + item.width, y: pdfY + item.height / 2 },
                thickness: shapeItem.style?.borderWidth || 1,
                color: borderColor,
              });
            }
          }
          else if (shapeItem.shapeType === "v-line") {
            if (borderColor) {
              page.drawLine({
                start: { x: item.x + item.width / 2, y: pdfY },
                end: { x: item.x + item.width / 2, y: pdfY + item.height },
                thickness: shapeItem.style?.borderWidth || 1,
                color: borderColor,
              });
            }
          }
          else {
            if (bgColor) {
              page.drawRectangle({
                x: item.x,
                y: pdfY,
                width: item.width,
                height: item.height,
                color: bgColor,
              });
            }
            if (borderColor && shapeItem.style?.borderWidth) {
              const thickness = shapeItem.style.borderWidth;

              page.drawLine({
                start: { x: item.x, y: pdfY + item.height },
                end: { x: item.x + item.width, y: pdfY + item.height },
                thickness: thickness,
                color: borderColor,
              });
              page.drawLine({
                start: { x: item.x + item.width, y: pdfY + item.height },
                end: { x: item.x + item.width, y: pdfY },
                thickness: thickness,
                color: borderColor,
              });
              page.drawLine({
                start: { x: item.x + item.width, y: pdfY },
                end: { x: item.x, y: pdfY },
                thickness: thickness,
                color: borderColor,
              });
              page.drawLine({
                start: { x: item.x, y: pdfY },
                end: { x: item.x, y: pdfY + item.height },
                thickness: thickness,
                color: borderColor,
              });
            }
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
        const { width, height } = entries[0].contentRect;
        if (width > 0) {
          setContainerWidth(width);
        }
        if (height > 0) {
          setContainerHeight(height);
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.unobserve(container);
    };
  }, []);

  const onDocumentLoadSuccess = () => {
    setError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error("PDF load error:", error);
    setError("PDFの読み込みに失敗しました");
  };

  const updateLayoutItem = (
    itemId: string,
    updateFn: (item: LayoutItem) => LayoutItem
  ) => {
    setLayout((prevLayout) =>
      prevLayout.map((item) => (item.id === itemId ? updateFn(item) : item))
    );
  };

  const handleTextChange = (itemId: string, content: string) => {
    const validation = textContentSchema.safeParse(content);
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
      if (item.type === "text") {
        return { ...item, content };
      }
      return item;
    });
  };

  // アナウンス機能（将来の拡張用）
  // const announce = useMemo(
  //   () => createAnnouncer(setAnnouncement),
  //   [setAnnouncement]
  // );

  const displayScale = useMemo(() => {
    if (!pageDimensions || containerWidth === 0 || containerHeight === 0) {
      return 1;
    }

    const scaleX = containerWidth / pageDimensions.width;
    const scaleY = containerHeight / pageDimensions.height;

    return Math.min(scaleX, scaleY);
  }, [pageDimensions, containerWidth, containerHeight]);

  const pdfFile = useMemo(() => {
    if (!pdfBytesForDisplay) return null;
    return { data: new Uint8Array(pdfBytesForDisplay) };
  }, [pdfBytesForDisplay]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const itemId = active.id as string;

    // 複数選択されている場合は、全てのアイテムを移動
    if (selectedIds.has(itemId) && selectedIds.size > 1) {
      const deltaX = delta.x / displayScale;
      const deltaY = delta.y / displayScale;

      setLayout((prevLayout) =>
        prevLayout.map((item) =>
          selectedIds.has(item.id)
            ? {
                ...item,
                x: item.x + deltaX,
                y: item.y + deltaY
              }
            : item
        )
      );
    } else {
      // 単一アイテムの移動
      const deltaX = delta.x / displayScale;
      const deltaY = delta.y / displayScale;

      updateLayoutItem(itemId, (item) => ({
        ...item,
        x: item.x + deltaX,
        y: item.y + deltaY,
      }));
    }
  };

  // 複数選択のハンドラー
  const handleItemClick = (itemId: string, event: React.MouseEvent) => {
    if (event.shiftKey) {
      // Shift+クリックで追加選択
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(itemId)) {
          newSet.delete(itemId);
        } else {
          newSet.add(itemId);
        }
        return newSet;
      });
      setIsMultiSelecting(true);
    } else if (event.ctrlKey || event.metaKey) {
      // Ctrl/Cmd+クリックでトグル選択
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(itemId)) {
          newSet.delete(itemId);
        } else {
          newSet.add(itemId);
        }
        setIsMultiSelecting(newSet.size > 0);
        return newSet;
      });
    } else {
      // 通常クリックは単一選択
      setSelectedIds(new Set([itemId]));
      setIsMultiSelecting(false);
      onSelectObject(itemId);
    }
  };

  // 全選択
  const selectAll = useCallback(() => {
    const allIds = new Set(
      invoiceData.layout.filter((item) => !item.locked).map((item) => item.id)
    );
    setSelectedIds(allIds);
    setIsMultiSelecting(true);
  }, [invoiceData.layout]);

  // 選択解除
  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
    setIsMultiSelecting(false);
    onSelectObject(null);
  }, [onSelectObject]);

  // キーボードショートカット for multi-selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + A で全選択
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        selectAll();
      }
      // Escape で選択解除
      if (e.key === 'Escape') {
        deselectAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectAll, deselectAll]);

  // invoiceDataとlayoutの検証
  if (!invoiceData || !invoiceData.layout) {
    return (
      <div className="w-full h-[1000px] bg-gray-200 rounded-lg flex justify-center items-center">
        <div className="text-red-500 text-center">
          <p>データが読み込まれていません</p>
        </div>
      </div>
    );
  }

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
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToParentElement]}
    >
      <div
        className="w-full h-full bg-gray-100 rounded-lg p-4 flex justify-center items-start overflow-auto"
        ref={containerRef}
      >
        {/* スクリーンリーダー用のライブリージョン */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          style={{
            position: 'absolute',
            left: '-10000px',
            width: '1px',
            height: '1px',
            overflow: 'hidden'
          }}
        >
          {announcement}
        </div>

        {/* キーボード操作の説明 */}
        <div
          id="keyboard-instructions"
          style={{
            position: 'absolute',
            left: '-10000px',
            width: '1px',
            height: '1px',
            overflow: 'hidden'
          }}
        >
          矢印キーで移動、Shiftキーと矢印キーで細かく移動、Ctrl/Cmdキーと矢印キーでサイズ変更、Altキーと左右矢印キーで回転、EnterまたはSpaceキーで選択
        </div>

        <div
          className="relative shadow-lg"
          style={{
            width: pageDimensions ? pageDimensions.width * displayScale : 0,
            height: pageDimensions ? pageDimensions.height * displayScale : 0,
          }}
          onClick={() => {
            onSelectObject(null);
            onSelectCell(null);
          }}
        >
          <div style={{ position: "absolute", zIndex: 1 }}>
            {pdfFile && containerWidth > 0 && pageDimensions ? (
              <Document
                file={pdfFile}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading="PDFを読み込んでいます..."
              >
                <Page
                  pageNumber={pageNumber}
                  width={pageDimensions.width * displayScale}
                />
              </Document>
            ) : (
              <div className="flex justify-center items-center h-full">
                <p>PDFプレビューを準備しています...</p>
              </div>
            )}
          </div>

          {pdfFile &&
            invoiceData.layout
              .filter((item) => item.visible !== false)
              .map((item) => {
                return (
                  <DraggableItem
                    key={item.id}
                    item={item}
                    displayScale={displayScale}
                    isSelected={selectedObjectId === item.id}
                    isMultiSelected={selectedIds.has(item.id)}
                    onClick={handleItemClick}
                    onSelect={() => onSelectObject(item.id)}
                    onResize={(width, height) => {
                      updateLayoutItem(item.id, (item) => ({
                        ...item,
                        width,
                        height,
                      }));
                    }}
                    onUpdatePosition={(x, y) => {
                      updateLayoutItem(item.id, (item) => ({
                        ...item,
                        x,
                        y,
                      }));
                    }}
                    onRotate={(rotation) => {
                      updateLayoutItem(item.id, (item) => ({
                        ...item,
                        rotation,
                      }));
                    }}
                    onUpdate={(updates) => {
                      updateLayoutItem(item.id, (item) => ({
                        ...item,
                        ...updates,
                      } as LayoutItem));
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
                              fontSize: `${
                                (item.style?.fontSize || 16) * displayScale
                              }px`,
                              fontFamily: item.style?.fontFamily || "Helvetica",
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
                            fontSize: `${
                              (item.style?.fontSize || 16) * displayScale
                            }px`,
                            fontWeight: item.style?.bold ? "bold" : "normal",
                            fontStyle: item.style?.italic ? "italic" : "normal",
                            textAlign: item.style?.textAlign || "left",
                            lineHeight: item.style?.lineHeight || 1,
                            whiteSpace: item.style?.wordWrap
                              ? "pre-wrap"
                              : "nowrap",
                            display: "flex",
                            alignItems:
                              item.style?.verticalAlign === "center"
                                ? "center"
                                : item.style?.verticalAlign === "bottom"
                                ? "flex-end"
                                : "flex-start",
                            height: "100%",
                            fontFamily: item.style?.fontFamily || "Helvetica",
                            backgroundColor:
                              item.style?.backgroundColor || "transparent",
                            textShadow: item.style?.textShadow || "none",
                          }}
                          className="cursor-text"
                          onDoubleClick={() => setEditingText(item.id)}
                        >
                          <>
                            {item.style?.isBullet ? (
                              <ul style={{ margin: 0, paddingLeft: "1.5em" }}>
                                {getPreviewProcessedContent(
                                  item,
                                  invoiceData,
                                  variableDisplayMode,
                                  companyInfo
                                )
                                  .replace(/・/g, "")
                                  .split("\n")
                                  .map((line: string, index: number) => (
                                    <li key={index}>{line || "\u00A0"}</li>
                                  ))}
                              </ul>
                            ) : (
                              getPreviewProcessedContent(
                                item,
                                invoiceData,
                                variableDisplayMode,
                                companyInfo
                              )
                                .split("\n")
                                .map((line: string, index: number) => (
                                  <div key={index}>{line || "\u00A0"}</div>
                                ))
                            )}
                          </>
                        </span>
                      ))}
                    {item.type === "image" && (
                      <img
                        src={item.src}
                        style={{
                          width: "100%",
                          height: "100%",
                          pointerEvents: "none",
                        }}
                        alt={`invoice-image`}
                      />
                    )}
                    {item.type === "table" && (
                      <>
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            backgroundColor:
                              item.style?.backgroundColor || "transparent",
                            overflow: "hidden",
                            pointerEvents: "none",
                          }}
                        >
                          <table
                            style={{
                              width: "100%",
                              height: "100%",
                              borderCollapse: "collapse",
                              tableLayout: "fixed",
                            }}
                          >
                            <tbody>
                              {(item.data as TableCell[][]).map(
                                (row, rowIndex) => (
                                  <tr key={rowIndex}>
                                    {row.map((cell, cellIndex) => {
                                      if (!cell) return null;

                                      const isSelected =
                                        selectedCell?.tableId === item.id &&
                                        selectedCell.rowIndex === rowIndex &&
                                        selectedCell.cellIndex === cellIndex;

                                      return (
                                        <td
                                          key={cell.id || `${rowIndex}-${cellIndex}`}
                                          style={{
                                            border: isSelected
                                              ? "1px solid blue"
                                              : "1px solid #ccc",
                                            padding: "5px",
                                            fontSize: `${12 * displayScale}px`,
                                            pointerEvents: "auto",
                                            color: cell.style?.color || "black",
                                            fontWeight: cell.style?.bold
                                              ? "bold"
                                              : "normal",
                                            fontStyle: cell.style?.italic
                                              ? "italic"
                                              : "normal",
                                            textAlign:
                                              cell.style?.textAlign || "left",
                                            backgroundColor:
                                              cell.style?.backgroundColor ||
                                              "transparent",
                                          }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onSelectCell({
                                              tableId: item.id,
                                              rowIndex,
                                              cellIndex,
                                            });
                                          }}
                                        >
                                          {getPreviewProcessedContent(
                                            cell,
                                            invoiceData,
                                            variableDisplayMode,
                                            companyInfo
                                          )}
                                        </td>
                                      );
                                    })}
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                    {item.type === "shape" && (
                      <div
                        style={(() => {
                          const shapeItem = item as ShapeItem;
                          const baseStyle = {
                            width: "100%",
                            height: "100%",
                          };

                          if (shapeItem.shapeType === "rect") {
                            return {
                              ...baseStyle,
                              backgroundColor:
                                shapeItem.style?.backgroundColor || "transparent",
                              border: shapeItem.style?.borderWidth
                                ? `${shapeItem.style.borderWidth}px ${
                                    shapeItem.style.borderStyle || "solid"
                                  } ${shapeItem.style.borderColor || "#000000"}`
                                : undefined,
                            };
                          } else if (shapeItem.shapeType === "h-line") {
                            return {
                              ...baseStyle,
                              backgroundColor: "transparent",
                              borderTop: `${shapeItem.style?.borderWidth || 1}px ${
                                shapeItem.style?.borderStyle || "solid"
                              } ${
                                shapeItem.style?.borderColor ||
                                shapeItem.style?.backgroundColor ||
                                "#000000"
                              }`,
                            };
                          } else if (shapeItem.shapeType === "v-line") {
                            return {
                              ...baseStyle,
                              backgroundColor: "transparent",
                              borderLeft: `${
                                shapeItem.style?.borderWidth || 1
                              }px ${shapeItem.style?.borderStyle || "solid"} ${
                                shapeItem.style?.borderColor ||
                                shapeItem.style?.backgroundColor ||
                                "#000000"
                              }`,
                            };
                          }
                          return baseStyle;
                        })()}
                      />
                    )}
                  </DraggableItem>
                );
              })}
        </div>
      </div>
    </DndContext>
  );
};
