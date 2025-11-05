import React, { useCallback, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import type { InvoiceData, CompanyInfo } from "../utils/types";
import { InvoiceDocument } from "../components/InvoiceDocument";
import { generateHtmlFromLayout } from "../utils/htmlGenerator";
import { useMutation } from "@apollo/client";
import { GENERATE_PDF_MUTATION } from "../graphql/invoiceQueries";

/**
 * PDF生成処理を管理するカスタムフック
 */
export const usePdfGeneration = (
  invoiceData: InvoiceData,
  companyInfo?: CompanyInfo
) => {
  const [generatePdfMutation] = useMutation(GENERATE_PDF_MUTATION);
  const [isGenerating, setIsGenerating] = useState(false);

  /**
   * React-PDFを使用してPDFを新しいタブで開く
   */
  const openPdfInNewTab = useCallback(async () => {
    const element = InvoiceDocument({ invoiceData, companyInfo }) as React.ReactElement;
    const blob = await pdf(element).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url);
  }, [invoiceData, companyInfo]);

  /**
   * Playwrightを使用してPDFを生成して新しいタブで開く
   */
  const openPdfWithPlaywright = useCallback(async () => {
    setIsGenerating(true);
    try {
      console.log("Starting Playwright PDF generation...");
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
    } catch (e) {
      console.error("Error generating PDF:", e);
      if (e && typeof e === 'object') {
        console.error("Error details:", 'graphQLErrors' in e ? e.graphQLErrors : undefined, 'networkError' in e ? e.networkError : undefined);
        const message = 'message' in e && typeof e.message === 'string' ? e.message : 'Unknown error';
        alert(`PDF生成に失敗しました: ${message}`);
      } else {
        alert(`PDF生成に失敗しました: ${String(e)}`);
      }
    } finally {
      setIsGenerating(false);
    }
  }, [invoiceData, companyInfo, generatePdfMutation]);

  return {
    openPdfInNewTab,
    openPdfWithPlaywright,
    isGenerating,
  };
};
