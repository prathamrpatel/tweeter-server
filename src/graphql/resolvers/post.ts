import {
  Resolver,
  Query,
  Ctx,
  Arg,
  Mutation,
  UseMiddleware,
  Int,
} from 'type-graphql';
import { isAuth } from '../../middleware/isAuth';
import { Context } from '../../types/Context';
import { getPaginatedPosts } from '../../util/getPaginatedPosts';
import { Comment } from '../typeDefs/Comment';
import { PaginatedPosts } from '../typeDefs/PaginatedPosts';
import { PaginatedPostsInput } from '../typeDefs/PaginatedPostsInput';
import { Post } from '../typeDefs/Post';
import { PostResponse } from '../typeDefs/PostResponse';

@Resolver()
export class PostResolver {
  @Query(() => [Comment])
  @UseMiddleware(isAuth)
  async getComments(
    @Arg('postId', () => Int) postId: number,
    @Ctx() { prisma }: Context
  ): Promise<Comment[]> {
    const comments = await prisma.comment.findMany({
      where: {
        postId,
      },
      include: {
        author: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return comments;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteComment(
    @Arg('commentId', () => Int) commentId: number,
    @Ctx() { req, prisma }: Context
  ): Promise<boolean> {
    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
    });

    if (!comment) {
      return true;
    }

    if (comment.authorId === req.session.userId) {
      await prisma.comment.delete({
        where: {
          id: commentId,
        },
      });
    }

    return true;
  }

  @Mutation(() => Comment)
  @UseMiddleware(isAuth)
  async createComment(
    @Arg('postId', () => Int) postId: number,
    @Arg('body') body: string,
    @Ctx() { req, prisma }: Context
  ): Promise<Comment> {
    const comment = await prisma.comment.create({
      data: {
        body,
        postId,
        authorId: req.session.userId!,
      },
      include: {
        author: true,
      },
    });

    return comment;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async unlikePost(
    @Arg('postId', () => Int) postId: number,
    @Ctx() { req, prisma }: Context
  ): Promise<boolean> {
    await prisma.like.delete({
      where: {
        postId_userId: {
          postId,
          userId: req.session.userId!,
        },
      },
    });

    return true;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async likePost(
    @Arg('postId', () => Int) postId: number,
    @Ctx() { req, prisma }: Context
  ): Promise<boolean> {
    await prisma.like.create({
      data: {
        postId,
        userId: req.session.userId!,
      },
    });

    return true;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg('postId', () => Int) postId: number,
    @Ctx() { req, prisma }: Context
  ): Promise<boolean> {
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) {
      return true;
    }

    if (post.authorId === req.session.userId) {
      await prisma.post.delete({
        where: {
          id: postId,
        },
      });

      return true;
    }

    return false;
  }

  @Mutation(() => PostResponse, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg('postId', () => Int) postId: number,
    @Arg('title') title: string,
    @Arg('body') body: string,
    @Ctx() { req, prisma }: Context
  ): Promise<PostResponse | null> {
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post || post.authorId !== req.session.userId) {
      return null;
    }

    if (body.length === 0) {
      return {
        errors: [
          {
            field: 'body',
            message: 'Body is required',
          },
        ],
      };
    }

    const updatedPost = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        body,
      },
      include: {
        author: true,
        likes: true,
        comments: {
          include: {
            author: true,
          },
        },
      },
    });

    return { post: updatedPost };
  }

  @Query(() => PaginatedPosts)
  @UseMiddleware(isAuth)
  async getPostsByUser(
    @Arg('input') input: PaginatedPostsInput,
    @Ctx() { req, prisma }: Context
  ): Promise<PaginatedPosts> {
    const authorId = req.session.userId;
    return await getPaginatedPosts(input, prisma, true, authorId);
  }

  @Mutation(() => PostResponse)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg('body') body: string,
    @Ctx() { req, prisma }: Context
  ): Promise<PostResponse> {
    if (body.length === 0) {
      return {
        errors: [
          {
            field: 'body',
            message: 'Body is required',
          },
        ],
      };
    }

    const post = await prisma.post.create({
      data: {
        body,
        authorId: req.session.userId!,
      },
      include: {
        author: true,
        likes: true,
        comments: {
          include: {
            author: true,
          },
        },
      },
    });

    return { post };
  }

  @Query(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async post(
    @Arg('postId', () => Int) postId: number,
    @Ctx() { prisma }: Context
  ): Promise<Post | null> {
    const post = prisma.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        author: true,
        likes: true,
        comments: {
          include: {
            author: true,
          },
        },
      },
    });

    if (!post) {
      return null;
    }

    return post;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg('input') input: PaginatedPostsInput,
    @Ctx() { prisma }: Context
  ): Promise<PaginatedPosts> {
    return await getPaginatedPosts(input, prisma, false);
  }
}
