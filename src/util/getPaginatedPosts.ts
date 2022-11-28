import { PrismaClient } from '@prisma/client';
import { PaginatedPostsInput } from '../graphql/typeDefs/PaginatedPostsInput';

export async function getPaginatedPosts(
  input: PaginatedPostsInput,
  prisma: PrismaClient,
  getPostsByUser: boolean, // If true it will only return the user posts
  authorId?: number
) {
  const { take, cursor } = input;
  const realTake = Math.min(50, take);
  const realTakePlusOne = realTake + 1;

  let posts = null;
  if (cursor) {
    if (getPostsByUser === true) {
      posts = await prisma.post.findMany({
        take: realTakePlusOne,
        skip: 1,
        cursor: cursor ? { createdAt: cursor } : undefined,
        orderBy: {
          createdAt: 'desc',
        },
        where: {
          authorId,
        },
        include: {
          author: true,
        },
      });
    } else {
      posts = await prisma.post.findMany({
        take: realTakePlusOne,
        skip: 1,
        cursor: cursor ? { createdAt: cursor } : undefined,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          author: true,
        },
      });
    }
  } else {
    if (getPostsByUser === true) {
      posts = await prisma.post.findMany({
        take: realTakePlusOne,
        cursor: cursor ? { createdAt: cursor } : undefined,
        orderBy: {
          createdAt: 'desc',
        },
        where: {
          authorId,
        },
        include: {
          author: true,
        },
      });
    } else {
      posts = await prisma.post.findMany({
        take: realTakePlusOne,
        cursor: cursor ? { createdAt: cursor } : undefined,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          author: true,
        },
      });
    }
  }

  return {
    posts: posts.slice(0, realTake), // Will return all but the last element
    hasMore: posts.length === realTakePlusOne,
  };
}
