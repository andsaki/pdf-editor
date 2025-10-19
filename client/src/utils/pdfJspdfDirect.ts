import jsPDF from "jspdf";
import type { InvoiceData } from "./types";
import { pxToMm } from "./coordinates";
import { getProcessedContent } from "./pdf";

/**
 * jsPDFを使用して直接描画する方式でPDFを生成
 * 日本語は文字化けするが、軽量で高速
 */
export const generatePdfWithJspdfDirect = (
  invoiceData: InvoiceData,
  companyInfo: any
): Blob => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // レイアウトアイテムを描画
  invoiceData.layout
    .filter((item) => item.visible !== false)
    .forEach((item) => {
      const x = pxToMm(item.x);
      const y = pxToMm(item.y);
      const width = pxToMm(item.width);
      const height = pxToMm(item.height);

      if (item.type === "text") {
        const processedContent = getProcessedContent(item, invoiceData, companyInfo);
        const fontSize = pxToMm(item.style?.fontSize || 16);
        const textAlign = item.style?.textAlign || "left";
        const fontWeight = item.style?.bold ? "bold" : "normal";
        const fontStyle = item.style?.italic ? "italic" : "normal";

        doc.setFontSize(fontSize * 3.78); // mm to pt conversion
        doc.setFont("helvetica", fontStyle === "italic" ? "italic" : fontWeight === "bold" ? "bold" : "normal");
        doc.text(processedContent, x, y + fontSize, { align: textAlign as any });
      } else if (item.type === "image" && "src" in item && item.src) {
        try {
          doc.addImage(item.src, "PNG", x, y, width, height);
        } catch (e) {
          console.error("Failed to add image:", e);
        }
      } else if (item.type === "table" && "data" in item && item.data) {
        let currentY = y;
        const cellHeight = height / item.data.length;

        item.data.forEach((row) => {
          let currentX = x;
          const cellWidth = width / row.length;

          row.forEach((cell) => {
            const processedContent = getProcessedContent(cell, invoiceData, companyInfo);
            const fontSize = pxToMm(cell.style?.fontSize || 12);

            // セルの枠線
            doc.setDrawColor("#cccccc");
            doc.rect(currentX, currentY, cellWidth, cellHeight);

            // セルの背景色
            if (cell.style?.backgroundColor && cell.style.backgroundColor !== "transparent") {
              doc.setFillColor(cell.style.backgroundColor);
              doc.rect(currentX, currentY, cellWidth, cellHeight, "F");
            }

            // セルのテキスト
            doc.setFontSize(fontSize * 3.78);
            doc.text(processedContent, currentX + 2, currentY + cellHeight / 2, {
              align: (cell.style?.textAlign || "left") as any,
              baseline: "middle",
            });

            currentX += cellWidth;
          });

          currentY += cellHeight;
        });
      } else if (item.type === "shape" && "shapeType" in item) {
        const borderColor = item.style?.borderColor || "#000000";
        const borderWidth = item.style?.borderWidth || 1;
        const backgroundColor = item.style?.backgroundColor || "transparent";

        doc.setDrawColor(borderColor);
        doc.setLineWidth(pxToMm(borderWidth));

        if (item.shapeType === "h-line") {
          doc.line(x, y, x + width, y);
        } else if (item.shapeType === "v-line") {
          doc.line(x, y, x, y + height);
        } else {
          // rect
          if (backgroundColor !== "transparent") {
            doc.setFillColor(backgroundColor);
            doc.rect(x, y, width, height, "FD");
          } else {
            doc.rect(x, y, width, height);
          }
        }
      }
    });

  return doc.output("blob");
};
