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
// 以下のフォントは全てGoogle Fontsから無料でダウンロード可能です：
// - Noto Sans JP: Googleが開発した高品質な日本語フォント（推奨）
// - BIZ UDPGothic: ユニバーサルデザインフォント（読みやすさ重視）
// - Noto Serif JP: 明朝体（フォーマルな文書向け）
// - M PLUS 1p / M PLUS Rounded 1c: モダンで読みやすいゴシック体

/**
 * 利用可能なフォントファミリーの型定義
 */
type FontFamily = "Noto Sans JP" | "BIZ UDPGothic" | "Noto Serif JP";

/**
 * 使用するフォントを選択（デフォルト: BIZ UDPGothic）
 */
const FONT_FAMILY: FontFamily = "BIZ UDPGothic";

// Noto Sans JP の登録
// Font.register({
//   family: "Noto Sans JP",
//   fonts: [
//     { src: "/fonts/NotoSansJP-Regular.ttf" },
//     { src: "/fonts/NotoSansJP-Medium.ttf", fontWeight: 500 },
//     { src: "/fonts/NotoSansJP-Bold.ttf", fontWeight: "bold" },
//   ],
// });

// BIZ UDPGothic の登録
Font.register({
  family: "BIZ UDPGothic",
  fonts: [
    { src: "/fonts/BIZUDPGothic-Regular.ttf" },
    { src: "/fonts/BIZUDPGothic-Bold.ttf", fontWeight: "bold" },
  ],
});

// Noto Serif JP の登録（明朝体を使用する場合）
// Font.register({
//   family: "Noto Serif JP",
//   fonts: [
//     { src: "/fonts/NotoSerifJP-Regular.ttf" },
//     { src: "/fonts/NotoSerifJP-Medium.ttf", fontWeight: 500 },
//     { src: "/fonts/NotoSerifJP-Bold.ttf", fontWeight: "bold" },
//   ],
// });

const styles = StyleSheet.create({
  page: {
    fontFamily: FONT_FAMILY,
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
