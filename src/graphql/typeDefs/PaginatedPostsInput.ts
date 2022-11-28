import { Field, InputType, Int } from 'type-graphql';

@InputType()
export class PaginatedPostsInput {
  @Field(() => Int)
  take: number;

  @Field({ nullable: true })
  cursor: string;
}
