import re
from typing import List, Optional
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

from .types import RawItem, NormalizedProduct, DedupeResult


class ProductDeduplicator:
    """Deduplicate products using embeddings and fuzzy matching"""

    def __init__(self, model_name: str = 'all-MiniLM-L6-v2'):
        try:
            self.model = SentenceTransformer(model_name)
        except Exception:
            # Fallback to mock embeddings for development
            self.model = None
        
        self.similarity_threshold = 0.85

    def find_duplicates(
        self, 
        new_product: NormalizedProduct, 
        existing_products: List[NormalizedProduct]
    ) -> List[DedupeResult]:
        """Find duplicates for a new product among existing products"""
        if not existing_products:
            return []
        
        results = []
        
        for existing_product in existing_products:
            similarity = self._calculate_similarity(new_product, existing_product)
            
            results.append(DedupeResult(
                is_duplicate=similarity >= self.similarity_threshold,
                confidence=similarity,
                matched_product_id=existing_product.canonical_sku
            ))
        
        return results

    def _calculate_similarity(self, product1: NormalizedProduct, product2: NormalizedProduct) -> float:
        """Calculate similarity between two products"""
        # Use multiple similarity methods and combine
        scores = []
        
        # 1. Title similarity
        title_sim = self._text_similarity(product1.title, product2.title)
        scores.append(title_sim * 0.4)
        
        # 2. Brand similarity
        brand_sim = self._brand_similarity(product1.brand, product2.brand)
        scores.append(brand_sim * 0.3)
        
        # 3. Category similarity
        category_sim = self._category_similarity(product1.category, product2.category)
        scores.append(category_sim * 0.2)
        
        # 4. Attribute similarity
        attr_sim = self._attribute_similarity(product1.attrs_json, product2.attrs_json)
        scores.append(attr_sim * 0.1)
        
        return sum(scores)

    def _text_similarity(self, text1: Optional[str], text2: Optional[str]) -> float:
        """Calculate text similarity using embeddings or fallback"""
        if not text1 or not text2:
            return 0.0
        
        # Try embeddings first
        if self.model:
            try:
                embeddings = self.model.encode([text1, text2])
                similarity = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
                return float(similarity)
            except Exception:
                pass
        
        # Fallback to Jaccard similarity
        return self._jaccard_similarity(text1, text2)

    def _jaccard_similarity(self, text1: str, text2: str) -> float:
        """Calculate Jaccard similarity between texts"""
        # Tokenize and normalize
        tokens1 = set(re.findall(r'\w+', text1.lower()))
        tokens2 = set(re.findall(r'\w+', text2.lower()))
        
        if not tokens1 or not tokens2:
            return 0.0
        
        intersection = len(tokens1.intersection(tokens2))
        union = len(tokens1.union(tokens2))
        
        return intersection / union if union > 0 else 0.0

    def _brand_similarity(self, brand1: Optional[str], brand2: Optional[str]) -> float:
        """Calculate brand similarity"""
        if not brand1 or not brand2:
            return 0.0
        
        if brand1.lower() == brand2.lower():
            return 1.0
        
        # Handle common brand variations
        brand_variations = {
            'apple': ['apple inc', 'apple computer'],
            'samsung': ['samsung electronics'],
            'sony': ['sony corporation'],
        }
        
        for main_brand, variations in brand_variations.items():
            if (brand1.lower() == main_brand and brand2.lower() in variations) or \
               (brand2.lower() == main_brand and brand1.lower() in variations):
                return 0.9
        
        return 0.0

    def _category_similarity(self, category1: Optional[str], category2: Optional[str]) -> float:
        """Calculate category similarity"""
        if not category1 or not category2:
            return 0.0
        
        if category1.lower() == category2.lower():
            return 1.0
        
        # Category hierarchy
        category_hierarchy = {
            'electronics': ['phones', 'computers', 'audio', 'gaming'],
            'phones': ['electronics'],
            'computers': ['electronics'],
            'audio': ['electronics'],
            'gaming': ['electronics'],
            'home': ['kitchen', 'furniture'],
            'fashion': ['clothing', 'shoes'],
        }
        
        cat1_lower = category1.lower()
        cat2_lower = category2.lower()
        
        # Check if categories are related
        if cat1_lower in category_hierarchy.get(cat2_lower, []) or \
           cat2_lower in category_hierarchy.get(cat1_lower, []):
            return 0.7
        
        return 0.0

    def _attribute_similarity(self, attrs1: dict, attrs2: dict) -> float:
        """Calculate attribute similarity"""
        if not attrs1 or not attrs2:
            return 0.0
        
        common_keys = set(attrs1.keys()).intersection(set(attrs2.keys()))
        if not common_keys:
            return 0.0
        
        matching_values = 0
        for key in common_keys:
            if str(attrs1[key]).lower() == str(attrs2[key]).lower():
                matching_values += 1
        
        return matching_values / len(common_keys) if common_keys else 0.0

    def get_most_similar(
        self, 
        new_product: NormalizedProduct, 
        existing_products: List[NormalizedProduct]
    ) -> Optional[DedupeResult]:
        """Get the most similar existing product"""
        duplicates = self.find_duplicates(new_product, existing_products)
        
        if not duplicates:
            return None
        
        # Return the one with highest confidence
        return max(duplicates, key=lambda x: x.confidence)