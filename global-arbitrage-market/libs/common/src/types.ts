export interface Product {
  id: string;
  canonical_sku: string;
  title: string;
  brand?: string;
  category?: string;
  attrs_json?: Record<string, any>;
  images: string[];
  quality_score: number;
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
  created_at: Date;
  updated_at: Date;
}

export interface Supplier {
  id: string;
  name: string;
  country: string;
  lead_time_days: number;
  policy_url?: string;
  contact?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface SupplierProduct {
  id: string;
  supplier_id: string;
  sku: string;
  name: string;
  brand?: string;
  category?: string;
  spec_json?: Record<string, any>;
  base_price: number;
  currency: string;
  moq: number;
  pack_qty: number;
  created_at: Date;
  updated_at: Date;
}

export interface Offer {
  id: string;
  product_id: string;
  supplier_product_id: string;
  region: string;
  landed_cost: number;
  currency: string;
  shipping_days: number;
  available_qty: number;
  created_at: Date;
  updated_at: Date;
}

export interface Listing {
  id: string;
  product_id: string;
  marketplace: string;
  title: string;
  description_md?: string;
  price: number;
  currency: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  created_at: Date;
  updated_at: Date;
}

export interface ArbitrageCandidate {
  product: Product;
  best_offer: Offer;
  target_price: number;
  landed_cost: number;
  margin_pct: number;
  abs_margin: number;
  quality_score: number;
  competition_data?: {
    avg_price: number;
    min_price: number;
    competitor_count: number;
  };
}

export interface LandedCostBreakdown {
  supplier_price: number;
  shipping_cost: number;
  import_duty: number;
  vat_tax: number;
  platform_fees: number;
  payment_fees: number;
  buffer: number;
  total: number;
}