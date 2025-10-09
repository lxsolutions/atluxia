import { ObjectType, Field, ID, Float } from '@nestjs/graphql';

@ObjectType()
export class Listing {
  @Field(() => ID)
  id: string;

  @Field()
  marketplace: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description_md?: string;

  @Field(() => Float)
  price: number;

  @Field()
  currency: string;

  @Field()
  status: string;

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;
}