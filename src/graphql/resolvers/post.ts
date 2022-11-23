import { Resolver, Query, Ctx, Arg, Int, Mutation } from 'type-graphql';
import { Context } from '../../types/Context';
import { Post } from '../typeDefs/Post';

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  async posts(@Ctx() { prisma }: Context) {
    return await prisma.post.findMany({});
  }

  @Query(() => Post)
  async post(@Arg('postId') postId: number, @Ctx() { prisma }: Context) {
    return await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });
  }
}
