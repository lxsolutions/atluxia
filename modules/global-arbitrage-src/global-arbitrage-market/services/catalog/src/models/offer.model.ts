import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { SupplierProduct } from './supplier-product.model';

@ObjectType()
export class Offer {
  @Field(() => ID)
  id: string;

  @Field()
  region: string;

  @Field(() => Float)
  landed_cost: number;

  @Field()
  currency: string;

  @Field(() => Int)
  shipping_days: number;

  @Field(() => Int)
  available_qty: number;

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;

  @Field(() => SupplierProduct)
  supplier_product: SupplierProduct;
}