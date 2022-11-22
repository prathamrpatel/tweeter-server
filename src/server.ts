import 'reflect-metadata';
import express from 'express';
import http from 'http';
import { ApolloServer } from 'apollo-server-express';
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault,
} from 'apollo-server-core';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './graphql/resolvers/hello';
import { PrismaClient } from '@prisma/client';

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  const prisma = new PrismaClient();

  const server = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver],
    }),
    context: ({ req, res }) => ({ req, res, prisma }),
    csrfPrevention: true,
    cache: 'bounded',
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
  });

  await server.start();
  server.applyMiddleware({
    app,
    cors: false,
  });

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: 4000 }, resolve)
  );

  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
}

startServer().catch((error) => console.log(error));
