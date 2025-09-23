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
import type { InvoiceData } from "../types";

// 重要: フォントファイルを /public/fonts ディレクトリに追加してください。
// BIZ UDPGothic は Google Fonts からダウンロードできます。
Font.register({
  family: 'BIZ UDPGothic',
  fonts: [
    { src: '/fonts/BIZUDPGothic-Regular.ttf' }, // font-style: normal, font-weight: normal
    { src: '/fonts/BIZUDPGothic-Bold.ttf', fontWeight: 'bold' },
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
  variableDisplayMode: 'name' | 'example';
}

const getProcessedContent = (item: any, invoiceData: InvoiceData, variableDisplayMode: 'name' | 'example') => {
  const { contentType, content, label } = item;
  const { form } = invoiceData;

  if (variableDisplayMode === 'name') {
    return content;
  }

  if (contentType === "labeled-variable") {
    const variableName = content.match(/{{(.*?)}}/)?.[1];
    if (variableName && variableName in form) {
      // @ts-ignore
      return `${label}${form[variableName]}`;
    }
  } else if (contentType === "variable") {
    const variableName = content.match(/{{(.*?)}}/)?.[1];
    if (variableName && variableName in form) {
      // @ts-ignore
      return form[variableName];
    }
  }
  return content;
};

export const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({ invoiceData, variableDisplayMode }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Invoice</Text>

      {
        invoiceData.layout.filter(item => item.visible !== false).sort((a, b) => a.zIndex - b.zIndex).map(item => {
          if (item.type === 'text') {
            const style: any = {
              position: "absolute",
              left: item.x,
              top: item.y,
              width: item.width,
              height: item.height,
              color: item.style?.color || 'black',
              fontSize: item.style?.fontSize || 12,
              lineHeight: item.style?.lineHeight || 1,
              textAlign: item.style?.textAlign || 'left',
              fontFamily: item.style?.fontFamily || 'Helvetica',
            };
            if (item.style?.bold) {
              style.fontWeight = 'bold';
            }
            if (item.style?.italic) {
              style.fontStyle = 'italic';
            }

            return (
              <Text
                key={item.id}
                style={style}
              >
                {getProcessedContent(item, invoiceData, variableDisplayMode)}
              </Text>
            );
          }
          if (item.type === 'image') {
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
          if (item.type === 'table') {
            // PDF table rendering can be complex, for now, we just render the data as text
            return (
              <View key={item.id} style={{ position: 'absolute', left: item.x, top: item.y }}>
                {item.data.map((row, rowIndex) => (
                  <View key={rowIndex} style={{ flexDirection: 'row' }}>
                    {row.map((cell, cellIndex) => (
                      <Text key={cellIndex} style={{ border: '1px solid #ccc', padding: 5 }}>{cell}</Text>
                    ))}
                  </View>
                ))}
              </View>
            )
          }
          return null;
        })
      }
    </Page>
  </Document>
);