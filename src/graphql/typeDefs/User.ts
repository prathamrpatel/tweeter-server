import { Field, Int, ObjectType } from 'type-graphql';

@ObjectType()
export class User {
  @Field(() => Int)
  id: number;

  @Field()
  email: string;

  @Field()
  username: Date;

  @Field()
  name: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
