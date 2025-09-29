import React from "react";
import { View, Text } from "@react-pdf/renderer";
import type { TableItem } from "../../../utils/types";

interface TableItemProps {
  item: TableItem;
}

export const PdfTableItem: React.FC<TableItemProps> = ({ item }) => {
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
};
