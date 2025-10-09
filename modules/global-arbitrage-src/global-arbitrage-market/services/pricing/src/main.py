import os
import json
import asyncio
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel

from .pricing_engine import PricingEngine
from .types import PricingRequest, PricingResult, ArbitrageCandidate


app = FastAPI(title="GAM Pricing Service", version="1.0.0")

# Initialize pricing engine
pricing_engine = PricingEngine()


class BatchPricingRequest(BaseModel):
    requests: List[PricingRequest]


class BatchPricingResponse(BaseModel):
    results: List[PricingResult]
    viable_count: int
    total_count: int


class ArbitrageAnalysisRequest(BaseModel):
    products: List[Dict[str, Any]]  # List of product data with supplier info


class ArbitrageAnalysisResponse(BaseModel):
    candidates: List[ArbitrageCandidate]
    total_analyzed: int
    viable_count: int


@app.get("/")
async def root():
    return {"message": "GAM Pricing Service", "status": "healthy"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.get("/fx-rates")
async def get_fx_rates():
    """Get current FX rates"""
    pricing_engine._update_fx_rates()
    return {
        "rates": pricing_engine.fx_rates,
        "last_updated": pricing_engine.fx_last_updated.isoformat() if pricing_engine.fx_last_updated else None
    }


@app.post("/calculate", response_model=PricingResult)
async def calculate_pricing(request: PricingRequest):
    """Calculate landed cost and pricing for a single product"""
    try:
        result = pricing_engine.calculate_landed_cost(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pricing calculation error: {str(e)}")


@app.post("/calculate-batch", response_model=BatchPricingResponse)
async def calculate_batch_pricing(request: BatchPricingRequest):
    """Calculate pricing for multiple products"""
    try:
        results = []
        
        for pricing_request in request.requests:
            result = pricing_engine.calculate_landed_cost(pricing_request)
            results.append(result)
        
        viable_count = sum(1 for r in results if r.is_viable)
        
        return BatchPricingResponse(
            results=results,
            viable_count=viable_count,
            total_count=len(results)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch pricing error: {str(e)}")


@app.post("/analyze-arbitrage", response_model=ArbitrageAnalysisResponse)
async def analyze_arbitrage(request: ArbitrageAnalysisRequest):
    """Analyze products for arbitrage opportunities"""
    try:
        candidates = []
        
        for product_data in request.products:
            # Create pricing request from product data
            pricing_request = PricingRequest(
                supplier_price=product_data.get('supplier_price', 0),
                supplier_currency=product_data.get('supplier_currency', 'USD'),
                supplier_country=product_data.get('supplier_country', 'CN'),
                destination_country=product_data.get('destination_country', 'US'),
                product_weight_kg=product_data.get('product_weight_kg', 1.0),
                product_value_usd=product_data.get('product_value_usd'),
                hs_code=product_data.get('hs_code'),
                shipping_method=product_data.get('shipping_method', 'standard')
            )
            
            # Calculate pricing
            result = pricing_engine.calculate_landed_cost(pricing_request)
            
            if result.is_viable:
                candidate = ArbitrageCandidate(
                    product_id=product_data.get('id', ''),
                    canonical_sku=product_data.get('canonical_sku', ''),
                    title=product_data.get('title', ''),
                    supplier_price=product_data.get('supplier_price', 0),
                    supplier_currency=product_data.get('supplier_currency', 'USD'),
                    landed_cost=result.landed_cost,
                    target_price=result.target_price,
                    margin_pct=result.margin_pct,
                    abs_margin=result.abs_margin,
                    quality_score=product_data.get('quality_score', 0.5),
                    competition_data=product_data.get('competition_data'),
                    breakdown=result.breakdown
                )
                candidates.append(candidate)
        
        return ArbitrageAnalysisResponse(
            candidates=candidates,
            total_analyzed=len(request.products),
            viable_count=len(candidates)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Arbitrage analysis error: {str(e)}")


@app.get("/test/sample")
async def test_sample_pricing():
    """Test pricing with sample data"""
    sample_requests = [
        PricingRequest(
            supplier_price=499.99,
            supplier_currency="USD",
            supplier_country="CN",
            destination_country="US",
            product_weight_kg=0.5,
            shipping_method="standard"
        ),
        PricingRequest(
            supplier_price=799.99,
            supplier_currency="USD",
            supplier_country="CN",
            destination_country="US",
            product_weight_kg=0.8,
            shipping_method="express"
        ),
        PricingRequest(
            supplier_price=299.99,
            supplier_currency="EUR",
            supplier_country="DE",
            destination_country="US",
            product_weight_kg=2.0,
            shipping_method="standard"
        ),
    ]
    
    results = []
    for request in sample_requests:
        result = pricing_engine.calculate_landed_cost(request)
        results.append({
            "request": request.dict(),
            "result": result.dict()
        })
    
    return {
        "sample_results": results,
        "fx_rates": pricing_engine.fx_rates
    }


@app.get("/config/thresholds")
async def get_arbitrage_thresholds():
    """Get current arbitrage thresholds"""
    return {
        "min_margin_pct": float(os.getenv("MIN_MARGIN_PCT", "0.15")),
        "min_abs_margin": float(os.getenv("MIN_ABS_MARGIN", "8.0")),
        "min_quality_score": float(os.getenv("MIN_QUALITY_SCORE", "0.65")),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)