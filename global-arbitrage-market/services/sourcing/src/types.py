from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from enum import Enum


class ProductStatus(str, Enum):
    DRAFT = "DRAFT"
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"


class RawItem(BaseModel):
    """Raw item from source connector"""
    source_id: str
    title: str
    description: Optional[str] = None
    brand: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    currency: Optional[str] = "USD"
    images: List[str] = []
    specs: Dict[str, Any] = {}
    url: Optional[str] = None
    metadata: Dict[str, Any] = {}


class NormalizedProduct(BaseModel):
    """Normalized product ready for catalog"""
    canonical_sku: str
    title: str
    brand: Optional[str] = None
    category: Optional[str] = None
    attrs_json: Dict[str, Any] = {}
    images: List[str] = []
    quality_score: float = 0.5
    status: ProductStatus = ProductStatus.DRAFT


class SupplierProduct(BaseModel):
    """Supplier-specific product information"""
    supplier_id: str
    sku: str
    name: str
    brand: Optional[str] = None
    category: Optional[str] = None
    spec_json: Dict[str, Any] = {}
    base_price: float
    currency: str = "USD"
    moq: int = 1
    pack_qty: int = 1


class QualityScore(BaseModel):
    """Product quality assessment"""
    overall: float
    brand_confidence: float
    spec_completeness: float
    image_quality: float
    review_confidence: float


class DedupeResult(BaseModel):
    """Deduplication result"""
    is_duplicate: bool
    confidence: float
    matched_product_id: Optional[str] = None