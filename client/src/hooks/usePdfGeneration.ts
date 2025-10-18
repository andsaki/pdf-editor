import { useCallback } from "react";
import type { InvoiceData } from "../utils/types";
import { generatePdfWithJspdfDirect } from "../utils/pdfJspdfDirect";
import { generatePdfWithHtml2canvas } from "../utils/pdfHtml2canvas";

/**
 * PDF生成処理を管理するカスタムフック
 */
export const usePdfGeneration = (
  invoiceData: InvoiceData,
  companyInfo: any
) => {
  /**
   * jsPDF直接描画版でPDFを新しいタブで開く
   * 日本語は文字化けするが軽量で高速
   */
  const openPdfInNewTab = useCallback(async () => {
    try {
      const blob = generatePdfWithJspdfDirect(invoiceData, companyInfo);
      const url = URL.createObjectURL(blob);
      window.open(url);
    } catch (error) {
      console.error("PDF生成エラー:", error);
      alert("PDF生成に失敗しました");
    }
  }, [invoiceData, companyInfo]);

  /**
   * html2canvas版でPDFを新しいタブで開く
   * 日本語も正しく表示されるが重い
   */
  const openPdfWithPuppeteer = useCallback(async () => {
    try {
      const blob = await generatePdfWithHtml2canvas(invoiceData, companyInfo);
      const url = URL.createObjectURL(blob);
      window.open(url);
    } catch (error) {
      console.error("PDF生成エラー:", error);
      alert("PDF生成に失敗しました");
    }
  }, [invoiceData, companyInfo]);

  return {
    openPdfInNewTab,
    openPdfWithPuppeteer,
  };
};
