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
    {
      src: "https://github.com/googlefonts/morisawa-biz-ud-gothic/raw/main/fonts/ttf/BIZUDPGothic-Regular.ttf",
    },
    {
      src: "https://github.com/googlefonts/morisawa-biz-ud-gothic/raw/main/fonts/ttf/BIZUDPGothic-Bold.ttf",
      fontWeight: "bold",
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
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
  variableDisplayMode: "name" | "example";
  companyInfo?: CompanyInfo;
}

const getProcessedContent = (
  item: LayoutItem,
  invoiceData: InvoiceData,
  variableDisplayMode: "name" | "example",
  companyInfo?: CompanyInfo
): string => {
  if (item.type !== "text") return "";
  const { contentType, content, label } = item;
  const { form } = invoiceData;

  const variableName = content.match(/{{(.*?)}}/)?.[1];

  if (!variableName) {
    return content;
  }

  if (variableName.startsWith("company_")) {
    const key = variableName.replace("company_", "");
    if (companyInfo && companyInfo[key]) {
      const companyInfoItem = companyInfo[key] as {
        label: string;
        value: string;
      };
      if (variableDisplayMode === "name") {
        return `{{${companyInfoItem.label}}}`;
      } else {
        return companyInfoItem.value;
      }
    }
  }

  if (variableDisplayMode === "example" && variableName in form) {
    const value = form[variableName as keyof typeof form] ?? "";
    if (contentType === "labeled-variable") {
      return `${label}${value}`;
    }
    return String(value);
  }

  return content;
};

export const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({
  invoiceData,
  variableDisplayMode,
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
              fontFamily: item.style?.fontFamily || "Helvetica",
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
                variableDisplayMode,
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
                  variableDisplayMode,
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
