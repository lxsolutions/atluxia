export const ARBITRAGE_THRESHOLDS = {
  MIN_MARGIN_PCT: 0.15,
  MIN_ABS_MARGIN: 8,
  MIN_QUALITY_SCORE: 0.65,
} as const;

export const PRODUCT_STATUS = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

export const LISTING_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
} as const;

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const;

export const CURRENCIES = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  CAD: 'CAD',
  JPY: 'JPY',
  CNY: 'CNY',
} as const;

export const REGIONS = {
  US: 'US',
  EU: 'EU',
  UK: 'UK',
  CA: 'CA',
  JP: 'JP',
  CN: 'CN',
} as const;

export const FEE_SCHEDULES = {
  US: {
    platform_pct: 0.10,
    payment_pct: 0.029,
    fixed_fee: 0.30,
  },
  EU: {
    platform_pct: 0.12,
    payment_pct: 0.025,
    fixed_fee: 0.25,
  },
} as const;