import type { InvoiceData, CompanyInfo } from "./types";
import { getProcessedContent } from "./pdf";
import { pxToMm } from "./coordinates";

/**
 * InvoiceDataからPuppeteer用のHTML文字列を生成する
 *
 * @param data 請求書データ
 * @param companyInfo 会社情報
 * @returns HTML文字列
 */
export const generateHtmlFromLayout = (
  data: InvoiceData,
  companyInfo?: CompanyInfo
): string => {
  // Generate a simple HTML representation of the invoice
  const itemsHtml = data.layout
    .filter((item) => item.visible !== false)
    .map((item) => {
      if (item.type === "text") {
        const processedContent = getProcessedContent(item, data, companyInfo);
        const wordWrap =
          item.style?.wordWrap !== false ? "break-word" : "normal";
        const whiteSpace =
          item.style?.wordWrap !== false ? "pre-wrap" : "nowrap";
        const overflow = item.style?.wordWrap !== false ? "visible" : "hidden";
        const textAlign = item.style?.textAlign || "left";
        const fontWeight = item.style?.bold ? "bold" : "normal";
        const fontStyle = item.style?.italic ? "italic" : "normal";
        const backgroundColor = item.style?.backgroundColor || "transparent";
        const lineHeight = item.style?.lineHeight || 1.5;

        return `<div class="item" style="left: ${pxToMm(item.x)}mm; top: ${pxToMm(item.y)}mm; width: ${pxToMm(item.width)}mm; height: ${pxToMm(item.height)}mm; font-size: ${pxToMm(item.style?.fontSize || 16)}mm; color: ${item.style?.color || "black"}; word-wrap: ${wordWrap}; white-space: ${whiteSpace}; overflow: ${overflow}; text-align: ${textAlign}; font-weight: ${fontWeight}; font-style: ${fontStyle}; background-color: ${backgroundColor}; line-height: ${lineHeight};">${processedContent}</div>`;
      } else if (item.type === "image" && "src" in item && item.src) {
        return `<div class="item" style="left: ${pxToMm(item.x)}mm; top: ${pxToMm(item.y)}mm; width: ${pxToMm(item.width)}mm; height: ${pxToMm(item.height)}mm;"><img src="${item.src}" style="width: 100%; height: 100%; object-fit: contain;" /></div>`;
      } else if (item.type === "table" && "data" in item && item.data) {
        const tableRows = item.data
          .map((row) => {
            const cells = row
              .map((cell) => {
                const processedContent = getProcessedContent(
                  cell,
                  data,
                  companyInfo
                );
                const cellStyle = `
                padding: 4px;
                border: 1px solid #ccc;
                font-size: ${pxToMm(cell.style?.fontSize || 12)}mm;
                color: ${cell.style?.color || "black"};
                text-align: ${cell.style?.textAlign || "left"};
                background-color: ${cell.style?.backgroundColor || "transparent"};
              `;
                return `<td style="${cellStyle}">${processedContent}</td>`;
              })
              .join("");
            return `<tr>${cells}</tr>`;
          })
          .join("");

        return `<div class="item" style="left: ${pxToMm(item.x)}mm; top: ${pxToMm(item.y)}mm; width: ${pxToMm(item.width)}mm; height: ${pxToMm(item.height)}mm;">
            <table style="width: 100%; height: 100%; border-collapse: collapse;">
              ${tableRows}
            </table>
          </div>`;
      } else if (item.type === "shape" && "shapeType" in item) {
        const backgroundColor = item.style?.backgroundColor || "transparent";
        const borderColor = item.style?.borderColor || "#000000";
        const borderWidth = item.style?.borderWidth || 1;
        const borderStyle = item.style?.borderStyle || "solid";
        const border = borderWidth
          ? `${pxToMm(borderWidth)}mm ${borderStyle} ${borderColor}`
          : "none";

        if (item.shapeType === "h-line") {
          return `<div class="item" style="left: ${pxToMm(item.x)}mm; top: ${pxToMm(item.y)}mm; width: ${pxToMm(item.width)}mm; height: ${pxToMm(item.height)}mm; border-top: ${border};"></div>`;
        } else if (item.shapeType === "v-line") {
          return `<div class="item" style="left: ${pxToMm(item.x)}mm; top: ${pxToMm(item.y)}mm; width: ${pxToMm(item.width)}mm; height: ${pxToMm(item.height)}mm; border-left: ${border};"></div>`;
        } else {
          // rect
          return `<div class="item" style="left: ${pxToMm(item.x)}mm; top: ${pxToMm(item.y)}mm; width: ${pxToMm(item.width)}mm; height: ${pxToMm(item.height)}mm; background-color: ${backgroundColor}; border: ${border};"></div>`;
        }
      }
      return "";
    })
    .join("");

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <style>
      @page { size: 210mm 297mm; margin: 0; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; padding: 0; }
      body { font-family: "BIZ UDPGothic", "Hiragino Sans", sans-serif; }
      .page {
        width: 210mm;
        height: 297mm;
        position: relative;
        background: white;
      }
      .item { position: absolute; }
    </style>
  </head>
  <body>
    <div class="page">
      ${itemsHtml}
    </div>
  </body>
</html>`;
};
