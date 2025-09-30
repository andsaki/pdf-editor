import React from "react";
import { View, Text } from "@react-pdf/renderer";
import type {
  TableItem,
  InvoiceData,
  CompanyInfo,
  TableCell,
} from "../../utils/types";
import { getProcessedContent } from "../../utils/pdf";
import type { Style } from "@react-pdf/types";

interface TableItemProps {
  item: TableItem;
  invoiceData: InvoiceData;
  companyInfo?: CompanyInfo;
}

export const PdfTableItem: React.FC<TableItemProps> = ({
  item,
  invoiceData,
  companyInfo,
}) => {
  return (
    <View
      key={item.id}
      style={{
        position: "absolute",
        left: item.x,
        top: item.y,
        width: item.width,
        height: item.height,
      }}
    >
      {(item.data as TableCell[][]).map((row, rowIndex) => (
        <View key={rowIndex} style={{ flexDirection: "row", width: "100%" }}>
          {row.map((cell) => {
            const cellStyle: Style = {
              width: `${100 / row.length}%`,
              border: "1px solid #ccc",
              padding: 5,
              color: cell.style?.color || "black",
              fontSize: cell.style?.fontSize || 12,
              lineHeight: cell.style?.lineHeight || 1,
              textAlign: cell.style?.textAlign || "left",
              fontFamily: cell.style?.fontFamily || "BIZ UDPGothic",
              backgroundColor: cell.style?.backgroundColor || "transparent",
            };
            if (cell.style?.bold) {
              cellStyle.fontWeight = "bold";
            }
            if (cell.style?.italic) {
              cellStyle.fontStyle = "italic";
            }

            return (
              <Text key={cell.id} style={cellStyle}>
                {getProcessedContent(cell, invoiceData, companyInfo)}
              </Text>
            );
          })}
        </View>
      ))}
    </View>
  );
};
