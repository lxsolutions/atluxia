import { Injectable, Logger } from '@nestjs/common';
import { MeilisearchService } from './meilisearch.service';

export interface SearchOptions {
  query?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface SearchResult {
  hits: any[];
  total: number;
  page: number;
  totalPages: number;
  processingTimeMs: number;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(private readonly meilisearchService: MeilisearchService) {}

  async searchProducts(options: SearchOptions): Promise<SearchResult> {
    try {
      const { query, category, brand, minPrice, maxPrice, page = 1, limit = 20 } = options;

      // Build filters
      const filters: string[] = [];
      
      if (category) {
        filters.push(`category = "${category}"`);
      }
      
      if (brand) {
        filters.push(`brand = "${brand}"`);
      }
      
      if (minPrice !== undefined || maxPrice !== undefined) {
        const priceFilter = [];
        if (minPrice !== undefined) priceFilter.push(`price >= ${minPrice}`);
        if (maxPrice !== undefined) priceFilter.push(`price <= ${maxPrice}`);
        filters.push(priceFilter.join(' AND '));
      }

      const searchResult = await this.meilisearchService.searchProducts({
        query: query || '',
        filters: filters.length > 0 ? filters.join(' AND ') : undefined,
        page,
        limit,
      });

      return {
        hits: searchResult.hits,
        total: searchResult.estimatedTotalHits,
        page,
        totalPages: Math.ceil(searchResult.estimatedTotalHits / limit),
        processingTimeMs: searchResult.processingTimeMs,
      };
    } catch (error) {
      this.logger.error('Search error:', error);
      throw error;
    }
  }

  async getSuggestions(query: string): Promise<string[]> {
    try {
      if (!query || query.length < 2) {
        return [];
      }

      const result = await this.meilisearchService.searchProducts({
        query,
        limit: 5,
        attributesToHighlight: ['title', 'brand', 'category'],
      });

      // Extract suggestions from search results
      const suggestions = new Set<string>();
      
      result.hits.forEach((hit: any) => {
        if (hit.title?.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(hit.title);
        }
        if (hit.brand?.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(hit.brand);
        }
        if (hit.category?.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(hit.category);
        }
      });

      return Array.from(suggestions).slice(0, 10);
    } catch (error) {
      this.logger.error('Suggestion error:', error);
      return [];
    }
  }

  async syncProducts(): Promise<{ success: boolean; message: string }> {
    try {
      await this.meilisearchService.syncProducts();
      return { success: true, message: 'Products synced successfully' };
    } catch (error) {
      this.logger.error('Sync error:', error);
      return { success: false, message: 'Failed to sync products' };
    }
  }

  async healthCheck(): Promise<{ status: string; meilisearch: boolean }> {
    try {
      const meilisearchHealthy = await this.meilisearchService.healthCheck();
      return {
        status: 'healthy',
        meilisearch: meilisearchHealthy,
      };
    } catch (error) {
      this.logger.error('Health check error:', error);
      return {
        status: 'unhealthy',
        meilisearch: false,
      };
    }
  }
}