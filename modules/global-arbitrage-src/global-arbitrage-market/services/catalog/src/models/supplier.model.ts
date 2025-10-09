import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class Supplier {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  country: string;

  @Field(() => Int)
  lead_time_days: number;

  @Field({ nullable: true })
  policy_url?: string;

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;
}