import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { MeiliSearch } from 'meilisearch';

interface SearchParams {
  query: string;
  filters?: string;
  page?: number;
  limit?: number;
  attributesToHighlight?: string[];
}

@Injectable()
export class MeilisearchService implements OnModuleInit {
  private readonly logger = new Logger(MeilisearchService.name);
  private client: MeiliSearch;
  private readonly indexName = 'products';

  constructor() {
    const meilisearchHost = process.env.MEILISEARCH_HOST || 'http://localhost:7700';
    const meilisearchApiKey = process.env.MEILISEARCH_API_KEY || 'masterKey';

    this.client = new MeiliSearch({
      host: meilisearchHost,
      apiKey: meilisearchApiKey,
    });
  }

  async onModuleInit() {
    await this.initializeIndex();
  }

  private async initializeIndex() {
    try {
      const index = this.client.index(this.indexName);
      
      // Configure searchable attributes
      await index.updateSearchableAttributes([
        'title',
        'brand',
        'category',
        'description',
      ]);

      // Configure filterable attributes
      await index.updateFilterableAttributes([
        'category',
        'brand',
        'price',
        'status',
        'qualityScore',
      ]);

      // Configure sortable attributes
      await index.updateSortableAttributes([
        'price',
        'createdAt',
        'qualityScore',
      ]);

      this.logger.log('Meilisearch index configured successfully');
    } catch (error) {
      this.logger.warn('Failed to configure Meilisearch index:', error);
    }
  }

  async searchProducts(params: SearchParams) {
    try {
      const {
        query,
        filters,
        page = 1,
        limit = 20,
        attributesToHighlight = ['title', 'brand', 'category'],
      } = params;

      const index = this.client.index(this.indexName);
      
      const searchOptions: any = {
        limit,
        offset: (page - 1) * limit,
        attributesToHighlight,
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>',
      };

      if (filters) {
        searchOptions.filter = filters;
      }

      const result = await index.search(query, searchOptions);
      return result;
    } catch (error) {
      this.logger.error('Meilisearch search error:', error);
      throw error;
    }
  }

  async syncProducts() {
    try {
      // In a real implementation, this would fetch products from the database
      // For now, we'll use a mock implementation
      const mockProducts = await this.getMockProducts();
      
      const index = this.client.index(this.indexName);
      const result = await index.addDocuments(mockProducts);
      
      this.logger.log(`Synced ${mockProducts.length} products to Meilisearch`);
      return result;
    } catch (error) {
      this.logger.error('Sync products error:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.health();
      return true;
    } catch (error) {
      this.logger.error('Meilisearch health check failed:', error);
      return false;
    }
  }

  private async getMockProducts() {
    // Mock products for development
    return [
      {
        id: '1',
        title: 'Wireless Bluetooth Headphones',
        brand: 'AudioTech',
        category: 'Electronics',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 99.99,
        status: 'ACTIVE',
        qualityScore: 0.85,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Ergonomic Office Chair',
        brand: 'ComfortSeat',
        category: 'Furniture',
        description: 'Comfortable office chair with lumbar support',
        price: 249.99,
        status: 'ACTIVE',
        qualityScore: 0.78,
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        title: 'Stainless Steel Water Bottle',
        brand: 'HydroFlask',
        category: 'Sports & Outdoors',
        description: 'Insulated water bottle keeps drinks cold for 24 hours',
        price: 34.99,
        status: 'ACTIVE',
        qualityScore: 0.92,
        createdAt: new Date().toISOString(),
      },
    ];
  }
}