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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableColHeader: {
    width: "70%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#f0f0f0",
    padding: 5,
  },
  tableCol: {
    width: "70%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  amountColHeader: {
    width: "30%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#f0f0f0",
    padding: 5,
  },
  amountCol: {
    width: "30%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  total: {
    position: "absolute",
    bottom: 100,
    right: 60, // Corresponds to page paddingRight
  },
});

interface InvoiceDocumentProps {
  invoiceData: InvoiceData;
}

export const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({
  invoiceData,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Invoice</Text>
      <View style={styles.header}>
        <Text>To: {invoiceData.to}</Text>
        <Text>From: {invoiceData.from}</Text>
      </View>

      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}>
            <Text>Description</Text>
          </View>
          <View style={styles.amountColHeader}>
            <Text>Amount</Text>
          </View>
        </View>
        {invoiceData.items.map((item, index) => (
          <View style={styles.tableRow} key={index}>
            <View style={styles.tableCol}>
              <Text>{item.description}</Text>
            </View>
            <View style={styles.amountCol}>
              <Text>${item.amount.toFixed(2)}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.total}>
        Total: $
        {invoiceData.items
          .reduce((acc, item) => acc + item.amount, 0)
          .toFixed(2)}
      </Text>

      <View style={{ marginTop: 20 }}>
        {invoiceData.customTexts.map((textBlock, index) => (
          <Text
            key={index}
            style={{
              position: "absolute",
              left: textBlock.x,
              top: textBlock.y,
            }}
          >
            {textBlock.content}
          </Text>
        ))}
      </View>

      <View>
        {invoiceData.images?.map((image, index) => (
          <Image
            key={`image-${index}`}
            src={image.data}
            style={{
              position: "absolute",
              left: image.x,
              top: image.y,
              width: image.width,
              height: image.height,
            }}
          />
        ))}
      </View>
    </Page>
  </Document>
);
