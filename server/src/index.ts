import express from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";

async function startServer() {
  console.log("Starting server...");
  const app = express();
  const httpServer = http.createServer(app);
  console.log("Express app and HTTP server created.");

  const corsOptions = {
    origin: "http://localhost:5173",
    optionsSuccessStatus: 200,
  };

  app.use(cors(corsOptions));

  // GraphQL schema and resolvers
  const typeDefs = `#graphql
    type CompanyInfoEntry {
      value: String
      label: String
    }

    type FloatEntry {
      value: Float
      label: String
    }

    type CompanyInfo {
      name: CompanyInfoEntry
      zip: CompanyInfoEntry
      prefecture: CompanyInfoEntry
      city: CompanyInfoEntry
      street: CompanyInfoEntry
      building: CompanyInfoEntry
      tel: CompanyInfoEntry
      fax: CompanyInfoEntry
      email: CompanyInfoEntry
      contact_person: CompanyInfoEntry
      registration_number: CompanyInfoEntry
      payment_due_date: CompanyInfoEntry
      bank_account: CompanyInfoEntry
    }

    input FormEntryInput {
      value: String
      label: String
    }

    input FloatEntryInput {
      value: Float
      label: String
    }

    type LineItem {
      name: CompanyInfoEntry
      date: CompanyInfoEntry
      quantity: FloatEntry
      unit_price: FloatEntry
      amount: FloatEntry
    }

    input LineItemInput {
      name: FormEntryInput
      date: FormEntryInput
      quantity: FloatEntryInput
      unit_price: FloatEntryInput
      amount: FloatEntryInput
    }

    input FormInput {
      issue_date: FormEntryInput
      due_date: FormEntryInput
      invoice_number: FormEntryInput
      company_name: FormEntryInput
      company_zip: FormEntryInput
      company_prefecture: FormEntryInput
      company_city: FormEntryInput
      company_street: FormEntryInput
      company_building: FormEntryInput
      company_tel: FormEntryInput
      company_email: FormEntryInput
      recipient_name: FormEntryInput
      recipient_title: FormEntryInput
      recipient_zip: FormEntryInput
      recipient_prefecture: FormEntryInput
      recipient_city: FormEntryInput
      recipient_street: FormEntryInput
      recipient_building: FormEntryInput
      recipient_tel: FormEntryInput
      recipient_email: FormEntryInput
      subtotal: FloatEntryInput
      tax: FloatEntryInput
      total: FloatEntryInput
      line_items: [LineItemInput!]
    }

    input LayoutItemInput {
      id: String!
      type: String!
      x: Float!
      y: Float!
      width: Float!
      height: Float!
      zIndex: Int!
      locked: Boolean
      visible: Boolean

      # TextItem
      content: String
      contentType: String
      label: String

      # ImageItem
      src: String

      # TableItem
      data: [[String]]

      # ShapeItem
      shapeType: String

      # Style properties (flattened)
      fontFamily: String
      fontSize: Float
      lineHeight: Float
      textAlign: String
      verticalAlign: String
      color: String
      bold: Boolean
      italic: Boolean
      wordWrap: Boolean
      backgroundColor: String
      textShadow: String
      isBullet: Boolean
    }

    input InvoiceDataInput {
      layout: [LayoutItemInput!]!
      form: FormInput!
    }

    type LayoutItem {
      id: String!
      type: String!
      x: Float!
      y: Float!
      width: Float!
      height: Float!
      zIndex: Int!
      locked: Boolean
      visible: Boolean

      # TextItem
      content: String
      contentType: String
      label: String

      # ImageItem
      src: String

      # TableItem
      data: [[String]]

      # ShapeItem
      shapeType: String

      # Style properties (flattened)
      fontFamily: String
      fontSize: Float
      lineHeight: Float
      textAlign: String
      verticalAlign: String
      color: String
      bold: Boolean
      italic: Boolean
      wordWrap: Boolean
      backgroundColor: String
      textShadow: String
      isBullet: Boolean
    }

    type Form {
      issue_date: CompanyInfoEntry
      due_date: CompanyInfoEntry
      invoice_number: CompanyInfoEntry
      company_name: CompanyInfoEntry
      company_zip: CompanyInfoEntry
      company_prefecture: CompanyInfoEntry
      company_city: CompanyInfoEntry
      company_street: CompanyInfoEntry
      company_building: CompanyInfoEntry
      company_tel: CompanyInfoEntry
      company_email: CompanyInfoEntry
      recipient_name: CompanyInfoEntry
      recipient_title: CompanyInfoEntry
      recipient_zip: CompanyInfoEntry
      recipient_prefecture: CompanyInfoEntry
      recipient_city: CompanyInfoEntry
      recipient_street: CompanyInfoEntry
      recipient_building: CompanyInfoEntry
      recipient_tel: CompanyInfoEntry
      recipient_email: CompanyInfoEntry
      subtotal: FloatEntry
      tax: FloatEntry
      total: FloatEntry
      line_items: [LineItem!]
    }

    type InvoiceData {
      layout: [LayoutItem!]!
      form: Form!
    }

    type Mutation {
      saveInvoice(invoiceData: InvoiceDataInput!): String
    }

    type Query {
      hello: String
      companyInfo: CompanyInfo
      getInvoice(id: ID!): InvoiceData
    }
  `;

  const resolvers = {
    Query: {
      hello: () => "Hello world!",
      companyInfo: () => {
        return {
          name: { value: "Your Company Name", label: "自社名" },
          zip: { value: "XXX-XXXX", label: "自社郵便番号" },
          prefecture: { value: "Your Prefecture", label: "自社都道府県" },
          city: { value: "Your City", label: "自社市区町村" },
          street: { value: "Your Street Address", label: "自社番地" },
          building: { value: "Your Building Name", label: "自社建物名" },
          tel: { value: "XX-XXXX-XXXX", label: "自社電話番号" },
          fax: { value: "XX-XXXX-XXXX", label: "自社FAX" },
          email: {
            value: "your.email@example.com",
            label: "自社メールアドレス",
          },
          contact_person: { value: "Contact Person", label: "自社担当者" },
          registration_number: {
            value: "TXXXXXXXXXXXXX",
            label: "自社適格請求書発行番号",
          },
          payment_due_date: { value: "End of Month", label: "支払期限" },
          bank_account: {
            value: "Bank Name Branch (Type) XXXXXXX",
            label: "振込先口座",
          },
        };
      },
      getInvoice: (_: any, { id }: { id: string }) => {
        console.log(`Fetching invoice with ID: ${id}`);
        // Since we don't have a database, return mock data for now.
        return {
          layout: [],
          form: {
            issue_date: { value: "2025-09-29", label: "発行日" },
            due_date: { value: "2025-10-31", label: "支払期限" },
            invoice_number: { value: "INV-001", label: "請求書番号" },
            company_name: { value: "My Awesome Company", label: "自社名" },
            company_prefecture: { value: "Tokyo", label: "自社_都道府県" },
            company_city: { value: "Shibuya-ku", label: "自社_市区町村" },
            company_street: { value: "Jinnan 1-1-1", label: "自社_番地" },
            company_building: {
              value: "Shibuya Building",
              label: "自社_建物名",
            },
            recipient_name: { value: "Customer Inc.", label: "宛名" },
            recipient_prefecture: { value: "Tokyo", label: "送付先_都道府県" },
            recipient_city: { value: "Shinjuku-ku", label: "送付先_市区町村" },
            recipient_street: {
              value: "Nishi-Shinjuku 2-8-1",
              label: "送付先_番地",
            },
            recipient_building: {
              value: "Tokyo Metropolitan Government Building",
              label: "送付先_建物名",
            },
            subtotal: { value: 120000, label: "小計" },
            tax: { value: 12000, label: "消費税" },
            total: { value: 132000, label: "合計金額" },
            line_items: [
              {
                name: { value: "Webサイト制作", label: "品目名" },
                date: { value: "2025-09-10", label: "日付" },
                quantity: { value: 1, label: "数量" },
                unit_price: { value: 80000, label: "単価" },
                amount: { value: 80000, label: "金額" },
              },
              {
                name: { value: "ロゴデザイン", label: "品目名" },
                date: { value: "2025-09-15", label: "日付" },
                quantity: { value: 1, label: "数量" },
                unit_price: { value: 30000, label: "単価" },
                amount: { value: 30000, label: "金額" },
              },
              {
                name: { value: "保守費用 (1ヶ月)", label: "品目名" },
                date: { value: "2025-09-01", label: "日付" },
                quantity: { value: 1, label: "数量" },
                unit_price: { value: 10000, label: "単価" },
                amount: { value: 10000, label: "金額" },
              },
            ],
          },
        };
      },
    },
    Mutation: {
      saveInvoice: (_: any, { invoiceData }: { invoiceData: any }) => {
        console.log(
          "Received invoice data via GraphQL:",
          JSON.stringify(invoiceData, null, 2)
        );
        // Here you would save the data to a database
        return "Invoice saved successfully!";
      },
    },
  };

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });
  console.log("Apollo Server instance created.");

  await server.start();
  console.log("Apollo Server started.");

  app.use("/graphql", bodyParser.json(), expressMiddleware(server));
  console.log("Middleware applied.");

  const PORT = 4000;
  await new Promise<void>((resolve) => {
    console.log("Starting HTTP server listener...");
    httpServer.listen({ port: PORT }, () => {
      console.log("HTTP server is listening.");
      resolve();
    });
  });
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
});
