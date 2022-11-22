import { Field, Int, ObjectType } from 'type-graphql';

@ObjectType()
export class Post {
  @Field(() => Int)
  id: number;

  @Field()
  body: string;

  @Field()
  authorId: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
