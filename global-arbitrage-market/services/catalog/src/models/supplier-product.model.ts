import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { Supplier } from './supplier.model';

@ObjectType()
export class SupplierProduct {
  @Field(() => ID)
  id: string;

  @Field()
  sku: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  brand?: string;

  @Field({ nullable: true })
  category?: string;

  @Field(() => Float)
  base_price: number;

  @Field()
  currency: string;

  @Field(() => Int)
  moq: number;

  @Field(() => Int)
  pack_qty: number;

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;

  @Field(() => Supplier)
  supplier: Supplier;
}