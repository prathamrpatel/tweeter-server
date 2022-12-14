import 'reflect-metadata';
import express from 'express';
import http from 'http';
import { ApolloServer } from 'apollo-server-express';
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageGraphQLPlayground,
} from 'apollo-server-core';
import { buildSchema } from 'type-graphql';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import { PostResolver } from './graphql/resolvers/post';
import { UserResolver } from './graphql/resolvers/user';
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { COOKIE_NAME, PORT, PRODUCTION } from './constants';

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  const prisma = new PrismaClient();

  const RedisStore = connectRedis(session);
  const redisClient = new Redis();

  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    })
  );

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      saveUninitialized: false,
      secret: 'akdjfkeireidkfvncmvvvncmvnxmvderikjknmnkk',
      resave: false,
      cookie: {
        secure: PRODUCTION,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    })
  );

  const server = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      emitSchemaFile: true,
    }),
    context: ({ req, res }) => ({ req, res, prisma }),
    csrfPrevention: true,
    cache: 'bounded',
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginLandingPageGraphQLPlayground(),
    ],
  });

  await server.start();
  server.applyMiddleware({
    app,
    cors: false,
  });

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: PORT }, resolve)
  );

  console.log(
    `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
  );
}

startServer().catch((error) => console.log(error));
