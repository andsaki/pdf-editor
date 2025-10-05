import React, { useEffect, useState, useRef, useMemo } from "react";
import type {
  InvoiceData,
  LayoutItem,
  ShapeItem,
  CompanyInfo,
  TableCell,
} from "../utils/types";
import { Rnd } from "react-rnd";
import { z } from "zod";
import { generateHtmlFromLayout } from "../utils/htmlGenerator";

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

/**
 * プレビュー用のテキストアイテムのコンテンツを処理し、表示文字列を返します。
 * - `variableDisplayMode` が `example` の場合は、変数名をラベルに置き換えます。
 * - それ以外の場合は、変数を実際の値に置き換えます。
 *
 * @param item レイアウトアイテム
 * @param invoiceData 請求書データ
 * @param variableDisplayMode 変数の表示モード
 * @param companyInfo 会社情報
 * @returns 処理済みのコンテンツ文字列
 */
const getPreviewProcessedContent = (
  item: LayoutItem | TableCell,
  invoiceData: InvoiceData,
  variableDisplayMode: "name" | "example",
  companyInfo?: CompanyInfo
): string => {
  if (
    !item ||
    typeof item !== "object" ||
    !("content" in item && "contentType" in item)
  ) {
    return "";
  }
  const { contentType, content, label } = item;

  const variableName = content.match(/{{(.*?)}}/)?.[1];
  if (!variableName) return content;

  const trimmedVariableName = variableName.trim();

  // データ例表示モード
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
        const separator = labelText && !labelText.endsWith(" ") ? " " : "";
        return `${labelText}${separator}{{${resolvedObject.label}}}`;
      }
      return `{{${resolvedObject.label}}}`;
    }
    if (contentType === "labeled-variable") {
      const labelText = label || "";
      const separator = labelText && !labelText.endsWith(" ") ? " " : "";
      return `${labelText}${separator}{{${trimmedVariableName}}}`;
    }
    return `{{${trimmedVariableName}}}`;
  }

  const resolvedValue = resolvePath(keys);

  if (resolvedValue !== undefined) {
    if (contentType === "labeled-variable") {
      // ラベルが空白で終わっていない場合は、ラベルと値の間にスペースを追加
      const labelText = label || "";
      const separator = labelText && !labelText.endsWith(" ") ? " " : "";
      return `${labelText}${separator}${resolvedValue}`;
    }
    return String(resolvedValue);
  }

  return `{{undefined}}`;
};

/**
 * 請求書のプレビューを表示し、レイアウト編集のユーザー操作を処理します。
 * @param {PdfPreviewProps} props コンポーネントのプロパティ
 * @returns {JSX.Element} レンダリングされたコンポーネント
 */
export const PdfPreview: React.FC<PdfPreviewProps> = ({
  invoiceData,
  setLayout,
  selectedObjectId,
  onSelectObject,
  selectedCell,
  onSelectCell,
  variableDisplayMode,
  companyInfo,
}) => {
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [containerHeight, setContainerHeight] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const [editingText, setEditingText] = useState<string | null>(null);

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // A4サイズのピクセル値 (96dpi)
  const A4_WIDTH_PX = 794; // 210mm
  const A4_HEIGHT_PX = 1123; // 297mm

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

  const displayScale = useMemo(() => {
    if (containerWidth === 0 || containerHeight === 0) {
      return 1;
    }

    const scaleX = containerWidth / A4_WIDTH_PX;
    const scaleY = containerHeight / A4_HEIGHT_PX;

    return Math.min(scaleX, scaleY);
  }, [containerWidth, containerHeight]);

  // HTMLプレビューを生成
  const htmlPreview = useMemo(() => {
    return generateHtmlFromLayout(invoiceData, companyInfo);
  }, [invoiceData, companyInfo]);

  return (
    <div
      className="w-full h-full bg-gray-100 rounded-lg p-4 flex justify-center items-start overflow-auto"
      ref={containerRef}
    >
      <div style={{ marginTop: "2rem" }}>
        <div
          className="relative shadow-lg bg-white"
          style={{
            width: A4_WIDTH_PX * displayScale,
            height: 800,
          }}
          onClick={() => {
            onSelectObject(null);
            onSelectCell(null);
          }}
        >
        {/* HTML プレビュー（背景） */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            pointerEvents: "none",
            transform: `translate(-50%, -50%) scale(${displayScale})`,
          }}
          dangerouslySetInnerHTML={{ __html: htmlPreview }}
        />

        {/* 編集可能なオーバーレイ */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) scale(${displayScale})`,
            transformOrigin: "top left",
            width: `${A4_WIDTH_PX}px`,
            height: `${A4_HEIGHT_PX}px`,
          }}
        >
        {invoiceData.layout
          .filter((item) => item.visible !== false)
          .map((item) => {
            const isShape = item.type === "shape";
            const shapeType = isShape ? (item as ShapeItem).shapeType : null;

            const enableResizing = item.locked
              ? false
              : isShape
              ? {
                  top: shapeType !== "h-line",
                  right: shapeType !== "v-line",
                  bottom: shapeType !== "h-line",
                  left: shapeType !== "v-line",
                  topRight: shapeType === "rect",
                  bottomRight: shapeType === "rect",
                  bottomLeft: shapeType === "rect",
                  topLeft: shapeType === "rect",
                }
              : true;

            return (
              <Rnd
                key={item.id}
                className="cursor-grab"
                style={{
                  border:
                    selectedObjectId === item.id
                      ? "1px solid blue"
                      : "1px dashed transparent",
                  zIndex: item.zIndex + 1000,
                }}
                size={{
                  width: item.width,
                  height: item.height,
                }}
                position={{
                  x: item.x,
                  y: item.y,
                }}
                onClick={(e: React.MouseEvent) => {
                  if (item.locked) return;
                  e.stopPropagation();
                  onSelectObject(item.id);
                }}
                onDragStop={(_e, d) => {
                  if (item.locked) return;
                  updateLayoutItem(item.id, (item) => ({
                    ...item,
                    x: d.x,
                    y: d.y,
                  }));
                }}
                onResizeStop={(_e, _direction, ref, _delta, position) => {
                  if (item.locked) return;
                  updateLayoutItem(item.id, (item) => ({
                    ...item,
                    x: position.x,
                    y: position.y,
                    width: parseFloat(ref.style.width),
                    height: parseFloat(ref.style.height),
                  }));
                }}
                disableDragging={item.locked}
                enableResizing={enableResizing}
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
                          {(item.data as TableCell[][]).map((row, rowIndex) => (
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
                          ))}
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
                          borderLeft: `${shapeItem.style?.borderWidth || 1}px ${
                            shapeItem.style?.borderStyle || "solid"
                          } ${
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
              </Rnd>
            );
          })}
        </div>
        </div>
      </div>
    </div>
  );
};
