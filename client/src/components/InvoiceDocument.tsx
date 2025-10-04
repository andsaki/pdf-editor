import React from "react";
import {
  Page,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { InvoiceData, CompanyInfo } from "../utils/types";
import { PdfTextItem } from "./pdf/TextItem";
import { PdfImageItem } from "./pdf/ImageItem";
import { PdfTableItem } from "./pdf/TableItem";

// 重要: フォントファイルを /public/fonts ディレクトリに追加してください。
// BIZ UDPGothic は Google Fonts からダウンロードできます。
Font.register({
  family: "BIZ UDPGothic",
  fonts: [
    { src: "/fonts/BIZUDPGothic-Regular.ttf" }, // 標準フォント（通常スタイル、通常ウェイト）
    { src: "/fonts/BIZUDPGothic-Bold.ttf", fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "BIZ UDPGothic",
    fontSize: 11,
    paddingTop: 30,
    paddingLeft: 60,
    paddingRight: 60,
    paddingBottom: 30,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
  },
});

interface InvoiceDocumentProps {
  invoiceData: InvoiceData;
  companyInfo?: CompanyInfo;
}

/**
 * PDFドキュメント全体をレンダリングするコンポーネント。
 *
 * @param {InvoiceDocumentProps} props
 * @returns {JSX.Element}
 */
export const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({
  invoiceData,
  companyInfo,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {invoiceData.layout
        .filter((item) => item.visible !== false)
        .sort((a, b) => a.zIndex - b.zIndex)
        .map((item) => {
          if (item.type === "text") {
            return <PdfTextItem key={item.id} item={item} invoiceData={invoiceData} companyInfo={companyInfo} />;
          }
          if (item.type === "image") {
            return <PdfImageItem key={item.id} item={item} />;
          }
          if (item.type === "table") {
            return <PdfTableItem key={item.id} item={item} invoiceData={invoiceData} companyInfo={companyInfo} />;
          }
          return null;
        })}
    </Page>
  </Document>
);
