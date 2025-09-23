import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';

async function startServer() {
  console.log('Starting server...');
  const app = express();
  const httpServer = http.createServer(app);
  console.log('Express app and HTTP server created.');

  const corsOptions = {
    origin: 'http://localhost:5173',
    optionsSuccessStatus: 200
  };

  app.use(cors(corsOptions));

  // GraphQL schema and resolvers
  const typeDefs = `#graphql
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
    }
  `;

  const resolvers = {
    Query: {
      hello: () => 'Hello world!',
    },
    Mutation: {
      saveInvoice: (_: any, { invoiceData }: { invoiceData: any }) => {
        console.log('Received invoice data via GraphQL:', JSON.stringify(invoiceData, null, 2));
        // Here you would save the data to a database
        return "Invoice saved successfully!";
      },
    },
  };

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });
  console.log('Apollo Server instance created.');

  await server.start();
  console.log('Apollo Server started.');

  app.use('/graphql', bodyParser.json(), expressMiddleware(server));
  console.log('Middleware applied.');



  const PORT = 4000;
  await new Promise<void>((resolve) => {
    console.log('Starting HTTP server listener...');
    httpServer.listen({ port: PORT }, () => {
      console.log('HTTP server is listening.');
      resolve();
    });
  });
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
}

startServer().catch(error => {
  console.error('Failed to start server:', error);
});
