import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import type { InvoiceData, LayoutItem, CompanyInfo } from "../utils/types";
import type { Style } from "@react-pdf/types";

// 重要: フォントファイルを /public/fonts ディレクトリに追加してください。
// BIZ UDPGothic は Google Fonts からダウンロードできます。
Font.register({
  family: "BIZ UDPGothic",
  fonts: [
    { src: "/fonts/BIZUDPGothic-Regular.ttf" }, // font-style: normal, font-weight: normal
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

const getProcessedContent = (
  item: LayoutItem,
  invoiceData: InvoiceData,
  companyInfo?: CompanyInfo
): string => {
  if (item.type !== "text") return "";
  const { contentType, content, label } = item;
  const { form } = invoiceData;

  const variableName = content.match(/{{(.*?)}}/)?.[1];

  if (!variableName) {
    return content;
  }

  const [source, key] = variableName.split(".");

  if (source === "companyInfo" && companyInfo && companyInfo[key]) {
    return companyInfo[key].value;
  }

  if (source === "form" && form && form[key as keyof typeof form]) {
    // @ts-ignore
    return form[key as keyof typeof form].value;
  }

  if (contentType === "labeled-variable") {
    const value = ""; // fallback for unresolved variables
    return `${label}${value}`;
  }

  return content;
};

export const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({
  invoiceData,
  companyInfo,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Invoice</Text>

      {invoiceData.layout
        .filter((item) => item.visible !== false)
        .sort((a, b) => a.zIndex - b.zIndex)
        .map((item) => {
          if (item.type === "text") {
            const style: Style = {
              position: "absolute",
              left: item.x,
              top: item.y,
              width: item.width,
              height: item.height,
              color: item.style?.color || "black",
              fontSize: item.style?.fontSize || 12,
              lineHeight: item.style?.lineHeight || 1,
              textAlign: item.style?.textAlign || "left",
              fontFamily: "BIZ UDPGothic",
              backgroundColor: item.style?.backgroundColor || "transparent",
            };
            if (item.style?.bold) {
              style.fontWeight = "bold";
            }
            if (item.style?.italic) {
              style.fontStyle = "italic";
            }

            if (item.style?.isBullet) {
              const lines = getProcessedContent(
                item,
                invoiceData,
                companyInfo
              )
                .replace(/・/g, "")
                .split("\n");

              return (
                <View key={item.id} style={style}>
                  {lines.map((line: string, index: number) => (
                    <Text key={index}>• {line}</Text>
                  ))}
                </View>
              );
            }

            return (
              <Text key={item.id} style={style}>
                {getProcessedContent(
                  item,
                  invoiceData,
                  companyInfo
                )}
              </Text>
            );
          }
          if (item.type === "image") {
            return (
              <Image
                key={item.id}
                src={item.data}
                style={{
                  position: "absolute",
                  left: item.x,
                  top: item.y,
                  width: item.width,
                  height: item.height,
                }}
              />
            );
          }
          if (item.type === "table") {
            // PDF table rendering can be complex, for now, we just render the data as text
            return (
              <View
                key={item.id}
                style={{ position: "absolute", left: item.x, top: item.y }}
              >
                {item.data.map((row, rowIndex) => (
                  <View key={rowIndex} style={{ flexDirection: "row" }}>
                    {row.map((cell, cellIndex) => (
                      <Text
                        key={cellIndex}
                        style={{ border: "1px solid #ccc", padding: 5 }}
                      >
                        {cell}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            );
          }
          return null;
        })}
    </Page>
  </Document>
);
