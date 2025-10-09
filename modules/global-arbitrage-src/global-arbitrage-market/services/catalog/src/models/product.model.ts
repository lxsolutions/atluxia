import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { Supplier } from './supplier.model';
import { Offer } from './offer.model';
import { Listing } from './listing.model';

@ObjectType()
export class Product {
  @Field(() => ID)
  id: string;

  @Field()
  canonical_sku: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  brand?: string;

  @Field({ nullable: true })
  category?: string;

  @Field(() => [String], { nullable: true })
  images?: string[];

  @Field(() => Float)
  quality_score: number;

  @Field()
  status: string;

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;

  @Field(() => [Offer])
  offers: Offer[];

  @Field(() => [Listing])
  listings: Listing[];
}