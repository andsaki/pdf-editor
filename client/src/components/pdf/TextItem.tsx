import React from "react";
import { Text, View } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import type { TextItem, InvoiceData, CompanyInfo } from "../../../utils/types";
import { getProcessedContent } from "../../../utils/pdf";

interface TextItemProps {
  item: TextItem;
  invoiceData: InvoiceData;
  companyInfo?: CompanyInfo;
}

export const PdfTextItem: React.FC<TextItemProps> = ({ item, invoiceData, companyInfo }) => {
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
    fontFamily: item.style?.fontFamily || "BIZ UDPGothic",
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
};
