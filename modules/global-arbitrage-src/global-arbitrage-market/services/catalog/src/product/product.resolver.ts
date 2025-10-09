import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ProductService } from './product.service';
import { Product } from '../models/product.model';
import { CreateProductInput, UpdateProductInput } from './dto/product.input';

@Resolver(() => Product)
export class ProductResolver {
  constructor(private readonly productService: ProductService) {}

  @Query(() => [Product])
  async products(
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
  ) {
    return this.productService.findAll(skip, take);
  }

  @Query(() => Product, { nullable: true })
  async product(@Args('id') id: string) {
    return this.productService.findOne(id);
  }

  @Query(() => Product, { nullable: true })
  async productBySku(@Args('canonicalSku') canonicalSku: string) {
    return this.productService.findBySku(canonicalSku);
  }

  @Query(() => [Product])
  async searchProducts(
    @Args('query') query: string,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
  ) {
    return this.productService.searchByText(query, skip, take);
  }

  @Mutation(() => Product)
  async createProduct(@Args('data') data: CreateProductInput) {
    return this.productService.create(data);
  }

  @Mutation(() => Product)
  async updateProduct(
    @Args('id') id: string,
    @Args('data') data: UpdateProductInput,
  ) {
    return this.productService.update(id, data);
  }

  @Mutation(() => Product)
  async deleteProduct(@Args('id') id: string) {
    return this.productService.remove(id);
  }
}