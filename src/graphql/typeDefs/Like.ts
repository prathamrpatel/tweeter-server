import { Field, Int, ObjectType } from 'type-graphql';

@ObjectType()
export class Like {
  @Field(() => Int)
  postId: number;

  @Field(() => Int)
  userId: number;
}
