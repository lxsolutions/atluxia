import asyncio
import json
import os
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from .connectors.csv_connector import CSVConnector
from .connectors.shopify_connector import ShopifyConnector
from .connectors.ebay_connector import EbayConnector
from .normalizer import ProductNormalizer
from .deduplicator import ProductDeduplicator
from .types import RawItem, NormalizedProduct


app = FastAPI(title="GAM Sourcing Service", version="1.0.0")

# Initialize components
normalizer = ProductNormalizer()
deduplicator = ProductDeduplicator()

# Available connectors
CONNECTORS = {
    'csv': CSVConnector,
    'shopify': ShopifyConnector,
    'ebay': EbayConnector,
}


class SourceRequest(BaseModel):
    connector_type: str
    config: Dict[str, Any]
    limit: int = 50


class SourceResponse(BaseModel):
    connector_type: str
    items_fetched: int
    items_normalized: int
    normalized_products: List[NormalizedProduct]
    errors: List[str] = []


@app.get("/")
async def root():
    return {"message": "GAM Sourcing Service", "status": "healthy"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.get("/connectors")
async def list_connectors():
    """List available connectors"""
    return {
        "connectors": list(CONNECTORS.keys()),
        "descriptions": {
            "csv": "CSV file connector for supplier data",
            "shopify": "Shopify Storefront API connector",
            "ebay": "eBay Finding API connector (mock for demo)",
        }
    }


@app.post("/source", response_model=SourceResponse)
async def source_products(request: SourceRequest):
    """Fetch and normalize products from a source"""
    try:
        # Get connector
        connector_class = CONNECTORS.get(request.connector_type)
        if not connector_class:
            raise HTTPException(status_code=400, detail=f"Unknown connector: {request.connector_type}")
        
        # Initialize connector
        connector = connector_class(request.config)
        
        # Fetch raw items
        raw_items = await connector.fetch(limit=request.limit)
        
        # Normalize items
        normalized_products = []
        errors = []
        
        for raw_item in raw_items:
            try:
                normalized = normalizer.normalize(raw_item)
                normalized_products.append(normalized)
            except Exception as e:
                errors.append(f"Failed to normalize {raw_item.source_id}: {str(e)}")
        
        return SourceResponse(
            connector_type=request.connector_type,
            items_fetched=len(raw_items),
            items_normalized=len(normalized_products),
            normalized_products=normalized_products,
            errors=errors
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Source error: {str(e)}")


@app.post("/deduplicate")
async def deduplicate_products(products: List[NormalizedProduct]):
    """Deduplicate a list of products"""
    if len(products) < 2:
        return {"duplicates": []}
    
    duplicates = []
    
    # Compare each product with all others
    for i, product1 in enumerate(products):
        for j, product2 in enumerate(products[i+1:], i+1):
            result = deduplicator.find_duplicates(product1, [product2])[0]
            if result.is_duplicate:
                duplicates.append({
                    "product1": product1.canonical_sku,
                    "product2": product2.canonical_sku,
                    "confidence": result.confidence,
                    "title1": product1.title,
                    "title2": product2.title,
                })
    
    return {"duplicates": duplicates}


@app.get("/test/csv")
async def test_csv_connector():
    """Test CSV connector with sample data"""
    # Create a sample CSV file for testing
    sample_csv = """id,title,brand,category,price,currency,images,description
prod1,Apple iPhone 14 Pro,Apple,Electronics,999,USD,https://example.com/iphone14.jpg,Latest iPhone with advanced camera
prod2,Samsung Galaxy S23,Samsung,Electronics,799,USD,https://example.com/galaxy.jpg,Powerful Android smartphone
prod3,Sony WH-1000XM4,Sony,Audio,349,USD,https://example.com/sony.jpg,Noise canceling headphones
"""
    
    # Write sample CSV
    csv_path = "/tmp/sample_products.csv"
    with open(csv_path, 'w') as f:
        f.write(sample_csv)
    
    # Test connector
    config = {
        'file_path': csv_path,
        'supplier_id': 'test_supplier'
    }
    
    connector = CSVConnector(config)
    raw_items = await connector.fetch()
    
    # Normalize
    normalized = []
    for item in raw_items:
        normalized.append(normalizer.normalize(item))
    
    # Clean up
    os.remove(csv_path)
    
    return {
        "raw_items": [item.dict() for item in raw_items],
        "normalized_products": [prod.dict() for prod in normalized]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)