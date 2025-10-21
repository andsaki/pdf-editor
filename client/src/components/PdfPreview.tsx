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
import { Rnd } from "react-rnd";
import { z } from "zod";
import {
  createAnnouncer,
  createKeyboardHandler,
  getItemAriaLabel,
} from "../utils/accessibility";

const textContentSchema = z.string().min(1, "テキストは空にできません");

interface PdfPreviewProps {
  invoiceData: InvoiceData;
  setLayout: React.Dispatch<React.SetStateAction<LayoutItem[]>>;
  selectedObjectId: string | null;
  selectedObjectIds: string[];
  onSelectObject: (id: string | null, multiSelect?: boolean) => void;
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
  if (!item || typeof item !== "object" || !("content" in item && "contentType" in item)) {
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
      // ラベルが空白で終わっていない場合は、ラベルと値の間にスペースを追加
      const labelText = label || "";
      const separator = labelText && !labelText.endsWith(' ') ? ' ' : '';
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
  selectedObjectIds,
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

  // ガイドライン用のstate
  const [guidelines, setGuidelines] = useState<{
    vertical: number[];
    horizontal: number[];
  }>({ vertical: [], horizontal: [] });

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
      console.log('Generating PDF with layout items:', invoiceData.layout.length);
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      const { height } = page.getSize();

      for (const item of invoiceData.layout) {
        console.log('Processing item type:', item.type);
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

          console.log('=== Shape Debug ===');
          console.log('Shape type:', shapeItem.shapeType);
          console.log('Shape item:', JSON.stringify(shapeItem, null, 2));
          console.log('Border color:', shapeItem.style?.borderColor);
          console.log('Border width:', shapeItem.style?.borderWidth);
          console.log('Background color:', shapeItem.style?.backgroundColor);

          const bgColor = shapeItem.style?.backgroundColor ? hexToRgb(shapeItem.style.backgroundColor) : undefined;
          const borderColor = shapeItem.style?.borderColor ? hexToRgb(shapeItem.style.borderColor) : undefined;

          console.log('Converted bg color:', bgColor);
          console.log('Converted border color:', borderColor);
          console.log('==================');

          // 横線の場合
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
          // 縦線の場合
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
          // 四角形の場合
          else {
            console.log('Drawing rectangle at:', { x: item.x, y: pdfY, width: item.width, height: item.height });
            console.log('Has bgColor:', !!bgColor, 'Has borderColor:', !!borderColor);

            // 背景色を描画
            if (bgColor) {
              console.log('Drawing background with color:', bgColor);
              page.drawRectangle({
                x: item.x,
                y: pdfY,
                width: item.width,
                height: item.height,
                color: bgColor,
              });
            }
            // 枠線を4本の線で描画
            if (borderColor && shapeItem.style?.borderWidth) {
              const thickness = shapeItem.style.borderWidth;
              console.log('Drawing border with thickness:', thickness, 'color:', borderColor);

              // 上の線
              page.drawLine({
                start: { x: item.x, y: pdfY + item.height },
                end: { x: item.x + item.width, y: pdfY + item.height },
                thickness: thickness,
                color: borderColor,
              });
              // 右の線
              page.drawLine({
                start: { x: item.x + item.width, y: pdfY + item.height },
                end: { x: item.x + item.width, y: pdfY },
                thickness: thickness,
                color: borderColor,
              });
              // 下の線
              page.drawLine({
                start: { x: item.x + item.width, y: pdfY },
                end: { x: item.x, y: pdfY },
                thickness: thickness,
                color: borderColor,
              });
              // 左の線
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
      console.log('PDF bytes generated, size:', bytes.length);
      setPdfBytesForDisplay(bytes);
      console.log('PDF state updated');
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

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log(`PDF loaded successfully with ${numPages} pages.`);
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

  const announce = useMemo(
    () => createAnnouncer(setAnnouncement),
    [setAnnouncement]
  );

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
    console.log('Creating pdfFile object with bytes length:', pdfBytesForDisplay.length);
    // react-pdfに変更を認識させるため新しい配列を作成
    return { data: new Uint8Array(pdfBytesForDisplay) };
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
      {/* スクリーンリーダー用のライブリージョン（画面外に配置） */}
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

      {/* キーボード操作の説明（画面外に配置） */}
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
        矢印キーで移動、Shiftキーと矢印キーで細かく移動、Ctrl/Cmdキーと矢印キーでサイズ変更、EnterまたはSpaceキーで選択
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

        {/* ガイドライン表示 */}
        {guidelines.vertical.map((x, i) => (
          <div
            key={`v-${i}`}
            style={{
              position: "absolute",
              left: x * displayScale,
              top: 0,
              width: "1px",
              height: pageDimensions ? pageDimensions.height * displayScale : 0,
              backgroundColor: "#ff00ff",
              pointerEvents: "none",
              zIndex: 10000,
            }}
          />
        ))}
        {guidelines.horizontal.map((y, i) => (
          <div
            key={`h-${i}`}
            style={{
              position: "absolute",
              left: 0,
              top: y * displayScale,
              width: pageDimensions ? pageDimensions.width * displayScale : 0,
              height: "1px",
              backgroundColor: "#ff00ff",
              pointerEvents: "none",
              zIndex: 10000,
            }}
          />
        ))}

        {pdfFile &&
          invoiceData.layout
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

              const processedContent = item.type === "text"
                ? getPreviewProcessedContent(item, invoiceData, variableDisplayMode, companyInfo)
                : undefined;
              const itemLabel = getItemAriaLabel(item, processedContent);

              return (
                <Rnd
                  key={item.id}
                  className="cursor-grab"
                  style={{
                    border:
                      selectedObjectIds.includes(item.id)
                        ? selectedObjectId === item.id
                          ? "1px solid blue"
                          : "1px solid #66aaff"
                        : "1px dashed transparent",
                    zIndex: item.zIndex,
                    outline: selectedObjectIds.includes(item.id)
                      ? selectedObjectId === item.id
                        ? "2px solid #0066ff"
                        : "2px solid #66aaff"
                      : "none",
                    outlineOffset: "2px",
                  }}
                  size={{
                    width: item.width * displayScale,
                    height: item.height * displayScale,
                  }}
                  position={{
                    x: item.x * displayScale,
                    y: item.y * displayScale,
                  }}
                  grid={[10 * displayScale, 10 * displayScale]}
                  onClick={(e: React.MouseEvent) => {
                    if (item.locked) return;
                    e.stopPropagation();
                    // Shift/Ctrl/Cmdキーが押されている場合は複数選択
                    const multiSelect = e.shiftKey || e.ctrlKey || e.metaKey;
                    onSelectObject(item.id, multiSelect);
                  }}
                  onDrag={(_e, d) => {
                    if (item.locked) return;

                    // ドラッグ中の座標（displayScaleを考慮）
                    const currentX = d.x / displayScale;
                    const currentY = d.y / displayScale;
                    const currentRight = currentX + item.width;
                    const currentBottom = currentY + item.height;
                    const currentCenterX = currentX + item.width / 2;
                    const currentCenterY = currentY + item.height / 2;

                    const threshold = 5; // 5px以内でガイドライン表示
                    const verticalLines: number[] = [];
                    const horizontalLines: number[] = [];

                    // 他のオブジェクトとの位置関係をチェック
                    invoiceData.layout.forEach((otherItem) => {
                      if (otherItem.id === item.id || otherItem.visible === false) return;

                      const otherRight = otherItem.x + otherItem.width;
                      const otherBottom = otherItem.y + otherItem.height;
                      const otherCenterX = otherItem.x + otherItem.width / 2;
                      const otherCenterY = otherItem.y + otherItem.height / 2;

                      // 垂直ガイドライン（左端、中心、右端）
                      if (Math.abs(currentX - otherItem.x) < threshold) {
                        verticalLines.push(otherItem.x);
                      }
                      if (Math.abs(currentCenterX - otherCenterX) < threshold) {
                        verticalLines.push(otherCenterX);
                      }
                      if (Math.abs(currentRight - otherRight) < threshold) {
                        verticalLines.push(otherRight);
                      }

                      // 水平ガイドライン（上端、中心、下端）
                      if (Math.abs(currentY - otherItem.y) < threshold) {
                        horizontalLines.push(otherItem.y);
                      }
                      if (Math.abs(currentCenterY - otherCenterY) < threshold) {
                        horizontalLines.push(otherCenterY);
                      }
                      if (Math.abs(currentBottom - otherBottom) < threshold) {
                        horizontalLines.push(otherBottom);
                      }
                    });

                    // 重複を削除
                    setGuidelines({
                      vertical: Array.from(new Set(verticalLines)),
                      horizontal: Array.from(new Set(horizontalLines)),
                    });
                  }}
                  onDragStop={(_e, d) => {
                    if (item.locked) return;

                    // 移動量を計算
                    const deltaX = d.x / displayScale - item.x;
                    const deltaY = d.y / displayScale - item.y;

                    // 複数選択されている場合は、全ての選択オブジェクトを移動
                    if (selectedObjectIds.length > 1 && selectedObjectIds.includes(item.id)) {
                      setLayout((prevLayout) =>
                        prevLayout.map((layoutItem) => {
                          if (selectedObjectIds.includes(layoutItem.id) && !layoutItem.locked) {
                            return {
                              ...layoutItem,
                              x: layoutItem.x + deltaX,
                              y: layoutItem.y + deltaY,
                            };
                          }
                          return layoutItem;
                        })
                      );
                    } else {
                      // 単一選択の場合は通常の更新
                      updateLayoutItem(item.id, (item) => ({
                        ...item,
                        x: d.x / displayScale,
                        y: d.y / displayScale,
                      }));
                    }

                    // ドラッグ終了時にガイドラインをクリア
                    setGuidelines({ vertical: [], horizontal: [] });
                  }}
                  onResizeStop={(_e, _direction, ref, _delta, position) => {
                    if (item.locked) return;
                    updateLayoutItem(item.id, (item) => ({
                      ...item,
                      x: position.x / displayScale,
                      y: position.y / displayScale,
                      width: parseFloat(ref.style.width) / displayScale,
                      height: parseFloat(ref.style.height) / displayScale,
                    }));
                  }}
                  disableDragging={item.locked}
                  enableResizing={enableResizing}
                  tabIndex={item.locked ? -1 : 0}
                  role="application"
                  aria-label={itemLabel}
                  aria-grabbed={selectedObjectIds.includes(item.id)}
                  aria-describedby="keyboard-instructions"
                  onKeyDown={createKeyboardHandler(
                    item,
                    updateLayoutItem,
                    announce,
                    onSelectObject
                  )}
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
                </Rnd>
              );
            })}
      </div>
    </div>
  );
};
