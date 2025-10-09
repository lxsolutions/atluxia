import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('products')
  async searchProducts(
    @Query('q') query: string,
    @Query('category') category?: string,
    @Query('brand') brand?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.searchService.searchProducts({
      query,
      category,
      brand,
      minPrice,
      maxPrice,
      page,
      limit,
    });
  }

  @Get('suggestions')
  async getSuggestions(@Query('q') query: string) {
    return this.searchService.getSuggestions(query);
  }

  @Post('sync')
  async syncProducts() {
    return this.searchService.syncProducts();
  }

  @Get('health')
  async healthCheck() {
    return this.searchService.healthCheck();
  }
}