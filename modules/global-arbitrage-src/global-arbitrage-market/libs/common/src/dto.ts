export interface CreateProductDto {
  canonical_sku: string;
  title: string;
  brand?: string;
  category?: string;
  images?: string[];
  quality_score?: number;
  status?: string;
}

export interface UpdateProductDto {
  title?: string;
  brand?: string;
  category?: string;
  images?: string[];
  quality_score?: number;
  status?: string;
}

export interface CreateSupplierDto {
  name: string;
  country: string;
  lead_time_days?: number;
  policy_url?: string;
  contact?: Record<string, any>;
}

export interface CreateListingDto {
  product_id: string;
  marketplace?: string;
  title: string;
  description_md?: string;
  price: number;
  currency?: string;
  status?: string;
}

export interface ArbitrageFilterDto {
  min_margin_pct?: number;
  min_abs_margin?: number;
  min_quality_score?: number;
  categories?: string[];
  regions?: string[];
}