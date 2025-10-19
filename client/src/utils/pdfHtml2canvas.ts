import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { InvoiceData } from "./types";
import { generateHtmlFromLayout } from "./htmlGenerator";

/**
 * html2canvasを使用してHTMLを画像化し、jsPDFでPDFを生成
 * 日本語も正しく表示されるが、画像化するため重い
 */
export const generatePdfWithHtml2canvas = async (
  invoiceData: InvoiceData,
  companyInfo: any
): Promise<Blob> => {
  // HTMLを生成
  const htmlContent = generateHtmlFromLayout(invoiceData, companyInfo);

  // 一時的なDIVを作成してHTMLを挿入
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlContent;
  tempDiv.style.position = "absolute";
  tempDiv.style.left = "-9999px";
  tempDiv.style.top = "0";
  document.body.appendChild(tempDiv);

  // A4サイズに相当するピクセル数 (210mm x 297mm at 96 DPI)
  const a4Width = 794; // 210mm
  const a4Height = 1123; // 297mm

  // html2canvasでレンダリング
  const canvas = await html2canvas(tempDiv.querySelector(".page") as HTMLElement, {
    scale: 2,
    width: a4Width,
    height: a4Height,
    backgroundColor: "#ffffff",
  });

  // 一時DIVを削除
  document.body.removeChild(tempDiv);

  // jsPDFでPDF作成
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const imgData = canvas.toDataURL("image/png");
  pdf.addImage(imgData, "PNG", 0, 0, 210, 297);

  return pdf.output("blob");
};
