import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import type { InvoiceData } from "../types";

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
}

export const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({ invoiceData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Invoice</Text>

      {
        invoiceData.layout.map(item => {
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
              fontFamily: item.style?.bold ? 'Helvetica-Bold' : (item.style?.italic ? 'Helvetica-Oblique' : 'Helvetica'),
            };
            if (item.style?.italic && item.style?.bold) {
              style.fontFamily = 'Helvetica-BoldOblique';
            }

            return (
              <Text
                key={item.id}
                style={style}
              >
                {item.content}
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
