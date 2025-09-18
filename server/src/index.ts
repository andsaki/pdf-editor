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

  // GraphQL schema and resolvers
  const typeDefs = `#graphql
    type Query {
      hello: String
    }
  `;

  const resolvers = {
    Query: {
      hello: () => 'Hello world!',
    },
  };

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });
  console.log('Apollo Server instance created.');

  await server.start();
  console.log('Apollo Server started.');

  app.use('/graphql', cors(), bodyParser.json(), expressMiddleware(server));
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
