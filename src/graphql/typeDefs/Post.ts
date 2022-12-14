import { Field, Int, ObjectType } from 'type-graphql';
import { Comment } from './Comment';
import { Like } from './Like';
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

  @Field(() => [Like])
  likes: Like[];

  @Field(() => [Comment])
  comments: Comment[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
