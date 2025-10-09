import re
import hashlib
from typing import List, Dict, Any
from .types import RawItem, NormalizedProduct, QualityScore


class ProductNormalizer:
    """Normalize raw items into standardized products"""

    def __init__(self):
        self.brand_patterns = {
            'apple': ['apple', 'iphone', 'ipad', 'macbook', 'mac'],
            'samsung': ['samsung', 'galaxy'],
            'sony': ['sony'],
            'nintendo': ['nintendo'],
            'dell': ['dell'],
            'hp': ['hp', 'hewlett packard'],
            'lenovo': ['lenovo'],
            'lg': ['lg'],
            'microsoft': ['microsoft', 'surface'],
        }

    def normalize(self, raw_item: RawItem) -> NormalizedProduct:
        """Normalize a raw item into a standardized product"""
        # Generate canonical SKU
        canonical_sku = self._generate_canonical_sku(raw_item)
        
        # Extract and clean attributes
        brand = self._extract_brand(raw_item)
        category = self._normalize_category(raw_item.category)
        
        # Build attributes JSON
        attrs_json = self._build_attributes(raw_item)
        
        # Calculate quality score
        quality_score = self._calculate_quality_score(raw_item, brand, category)
        
        return NormalizedProduct(
            canonical_sku=canonical_sku,
            title=self._clean_title(raw_item.title),
            brand=brand,
            category=category,
            attrs_json=attrs_json,
            images=raw_item.images,
            quality_score=quality_score.overall,
            status='DRAFT'
        )

    def _generate_canonical_sku(self, raw_item: RawItem) -> str:
        """Generate a canonical SKU from item data"""
        # Use a hash of key attributes to create a unique but stable SKU
        key_data = f"{raw_item.title}_{raw_item.brand or ''}_{raw_item.category or ''}"
        
        # Clean and normalize
        key_data = re.sub(r'[^a-zA-Z0-9]', '', key_data.lower())
        
        # Create hash
        hash_obj = hashlib.md5(key_data.encode())
        return f"prod_{hash_obj.hexdigest()[:12]}"

    def _extract_brand(self, raw_item: RawItem) -> str:
        """Extract and normalize brand from item data"""
        # First check explicit brand field
        if raw_item.brand:
            return self._normalize_brand(raw_item.brand)
        
        # Try to extract from title
        title_lower = raw_item.title.lower()
        
        for brand, patterns in self.brand_patterns.items():
            for pattern in patterns:
                if pattern in title_lower:
                    return brand.title()
        
        # Return unknown if no brand detected
        return "Unknown"

    def _normalize_brand(self, brand: str) -> str:
        """Normalize brand name"""
        if not brand:
            return "Unknown"
        
        brand_lower = brand.lower().strip()
        
        for known_brand, patterns in self.brand_patterns.items():
            for pattern in patterns:
                if pattern in brand_lower:
                    return known_brand.title()
        
        # Capitalize first letter of each word for unknown brands
        return ' '.join(word.capitalize() for word in brand_lower.split())

    def _normalize_category(self, category: str) -> str:
        """Normalize category name"""
        if not category:
            return "Other"
        
        category_lower = category.lower().strip()
        
        # Common category mappings
        category_mappings = {
            'electronics': ['electronics', 'electronic', 'tech'],
            'phones': ['phone', 'smartphone', 'cell phone', 'mobile'],
            'computers': ['computer', 'laptop', 'notebook', 'pc'],
            'audio': ['headphone', 'earphone', 'speaker', 'audio'],
            'gaming': ['game', 'gaming', 'console', 'nintendo', 'playstation', 'xbox'],
            'home': ['home', 'kitchen', 'appliance', 'furniture'],
            'fashion': ['clothing', 'fashion', 'shoes', 'accessories'],
        }
        
        for normalized_cat, patterns in category_mappings.items():
            for pattern in patterns:
                if pattern in category_lower:
                    return normalized_cat.title()
        
        return category.title()

    def _clean_title(self, title: str) -> str:
        """Clean and normalize product title"""
        if not title:
            return ""
        
        # Remove excessive whitespace
        title = re.sub(r'\s+', ' ', title.strip())
        
        # Remove common marketing fluff
        fluff_patterns = [
            r'\bnew\b',
            r'\bfree shipping\b',
            r'\bfast shipping\b',
            r'\b100% authentic\b',
            r'\bbrand new\b',
            r'\bsealed\b',
            r'\bwarranty\b',
            r'!!!+',
        ]
        
        for pattern in fluff_patterns:
            title = re.sub(pattern, '', title, flags=re.IGNORECASE)
        
        # Clean up resulting whitespace
        title = re.sub(r'\s+', ' ', title).strip()
        
        return title

    def _build_attributes(self, raw_item: RawItem) -> Dict[str, Any]:
        """Build standardized attributes from raw item"""
        attrs = {}
        
        # Copy specs
        if raw_item.specs:
            attrs.update(raw_item.specs)
        
        # Add metadata
        if raw_item.metadata:
            attrs['source_metadata'] = raw_item.metadata
        
        # Extract basic attributes
        if raw_item.description:
            attrs['description'] = raw_item.description
        
        if raw_item.url:
            attrs['source_url'] = raw_item.url
        
        return attrs

    def _calculate_quality_score(self, raw_item: RawItem, brand: str, category: str) -> QualityScore:
        """Calculate product quality score"""
        scores = {
            'brand_confidence': 0.5,
            'spec_completeness': 0.3,
            'image_quality': 0.5,
            'review_confidence': 0.5,
        }
        
        # Brand confidence
        if brand != "Unknown":
            scores['brand_confidence'] = 0.9
        
        # Spec completeness
        spec_count = len(raw_item.specs) if raw_item.specs else 0
        if spec_count > 5:
            scores['spec_completeness'] = 0.9
        elif spec_count > 2:
            scores['spec_completeness'] = 0.7
        elif spec_count > 0:
            scores['spec_completeness'] = 0.5
        
        # Image quality
        if len(raw_item.images) >= 3:
            scores['image_quality'] = 0.9
        elif len(raw_item.images) >= 1:
            scores['image_quality'] = 0.7
        else:
            scores['image_quality'] = 0.2
        
        # Review confidence (placeholder)
        # In production, this would analyze review data
        
        # Calculate overall score (weighted average)
        weights = {
            'brand_confidence': 0.3,
            'spec_completeness': 0.25,
            'image_quality': 0.25,
            'review_confidence': 0.2,
        }
        
        overall = sum(scores[key] * weights[key] for key in scores)
        
        return QualityScore(
            overall=round(overall, 2),
            **scores
        )