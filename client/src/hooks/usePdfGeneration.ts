import { useCallback } from "react";
import type { InvoiceData } from "../utils/types";
import { generateHtmlFromLayout } from "../utils/htmlGenerator";
import { useMutation } from "@apollo/client";
import { GENERATE_PDF_MUTATION } from "../graphql/invoiceQueries";

/**
 * PDF生成処理を管理するカスタムフック
 */
export const usePdfGeneration = (
  invoiceData: InvoiceData,
  companyInfo: any
) => {
  const [generatePdfMutation] = useMutation(GENERATE_PDF_MUTATION);

  /**
   * Puppeteerを使用してPDFを生成して新しいタブで開く
   */
  const openPdfWithPuppeteer = useCallback(async () => {
    try {
      console.log("Starting Puppeteer PDF generation...");
      // 現在のレイアウトからHTMLを生成
      const htmlContent = generateHtmlFromLayout(invoiceData, companyInfo);
      console.log("Generated HTML:", htmlContent);

      const result = await generatePdfMutation({
        variables: { html: htmlContent },
      });

      console.log("Mutation result:", result);

      if (result.data?.generatePdf) {
        // base64をblobに変換
        const base64 = result.data.generatePdf;
        console.log("Received base64 PDF, length:", base64.length);
        const binaryString = window.atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        console.log("Opening PDF URL:", url);
        window.open(url);
      } else {
        console.error("No PDF data in result:", result);
        alert("PDF生成に失敗しました: データが返されませんでした");
      }
    } catch (e: any) {
      console.error("Error generating PDF:", e);
      console.error("Error details:", e.graphQLErrors, e.networkError);
      alert(`PDF生成に失敗しました: ${e.message}`);
    }
  }, [invoiceData, companyInfo, generatePdfMutation]);

  return {
    openPdfWithPuppeteer,
  };
};
