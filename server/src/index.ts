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

    input FormInput {
      issue_date: String
      due_date: String
      invoice_number: String
      company_name: String
      company_zip: String
      company_address: String
      company_tel: String
      company_email: String
      recipient_name: String
      recipient_title: String
      recipient_zip: String
      recipient_address: String
      recipient_tel: String
      recipient_email: String
      subtotal: Float
      tax: Float
      total: Float
    }

    input StyleInput {
      fontFamily: String
      fontSize: Float
      lineHeight: Float
      textAlign: String
      verticalAlign: String
      color: String
      bold: Boolean
      italic: Boolean
      wordWrap: Boolean
    }

    input LayoutItemInput {
      id: String!
      type: String!
      x: Float!
      y: Float!
      width: Float!
      height: Float!
      content: String
      contentType: String
      label: String
      data: [[String]]
      style: StyleInput
    }

    input InvoiceDataInput {
      layout: [LayoutItemInput!]!
      form: FormInput!
    }

    type Mutation {
      saveInvoice(invoiceData: InvoiceDataInput!): String
    }

    type Query {
      hello: String
      companyInfo: CompanyInfo
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
          bank_account: { value: "Bank Name Branch (Type) XXXXXXX", label: "振込先口座" },
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