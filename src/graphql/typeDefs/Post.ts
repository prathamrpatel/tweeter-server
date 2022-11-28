import { Field, Int, ObjectType } from 'type-graphql';
import { User } from './User';

@ObjectType()
export class Post {
  @Field(() => Int)
  id: number;

  @Field()
  body: string;

  @Field(() => Int)
  authorId: number;

  @Field()
  author: User;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
