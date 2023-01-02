import { Field, Int, ObjectType } from 'type-graphql';
import { User } from './User';

@ObjectType()
export class Comment {
  @Field(() => Int)
  id: number;

  @Field()
  body: string;

  @Field(() => Int)
  postId: number;

  @Field(() => Int)
  authorId: number;

  @Field(() => User)
  author: User;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
