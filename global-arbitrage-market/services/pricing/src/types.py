from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from enum import Enum


class Currency(str, Enum):
    USD = "USD"
    EUR = "EUR"
    GBP = "GBP"
    CAD = "CAD"
    JPY = "JPY"
    CNY = "CNY"


class Region(str, Enum):
    US = "US"
    EU = "EU"
    UK = "UK"
    CA = "CA"
    JP = "JP"
    CN = "CN"


class PricingRequest(BaseModel):
    """Request for landed cost calculation"""
    supplier_price: float
    supplier_currency: Currency
    supplier_country: str
    destination_country: str
    product_weight_kg: float = 1.0
    product_value_usd: Optional[float] = None
    hs_code: Optional[str] = None
    shipping_method: str = "standard"


class LandedCostBreakdown(BaseModel):
    """Detailed breakdown of landed cost"""
    supplier_price_usd: float
    shipping_cost: float
    import_duty: float
    vat_tax: float
    platform_fees: float
    payment_fees: float
    buffer: float
    total_landed_cost: float


class FeeSchedule(BaseModel):
    """Fee schedule for a region"""
    region: Region
    platform_pct: float
    payment_pct: float
    fixed_fee: float


class FXRate(BaseModel):
    """Foreign exchange rate"""
    base: Currency
    quote: Currency
    rate: float
    as_of: str


class DutyRule(BaseModel):
    """Import duty rule"""
    hs_code: str
    origin: str
    dest: str
    duty_pct: float


class ArbitrageCandidate(BaseModel):
    """Arbitrage candidate with pricing data"""
    product_id: str
    canonical_sku: str
    title: str
    supplier_price: float
    supplier_currency: Currency
    landed_cost: float
    target_price: float
    margin_pct: float
    abs_margin: float
    quality_score: float
    competition_data: Optional[Dict[str, Any]] = None
    breakdown: LandedCostBreakdown


class PricingResult(BaseModel):
    """Pricing calculation result"""
    landed_cost: float
    target_price: float
    margin_pct: float
    abs_margin: float
    breakdown: LandedCostBreakdown
    is_viable: bool
    reason: Optional[str] = None