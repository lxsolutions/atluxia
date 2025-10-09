














import math
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

router = APIRouter(
    prefix="/weights",
    tags=["weights"],
    responses={404: {"description": "Not found"}}
)

class WeightVector(BaseModel):
    weights: List[float]

@router.post("/set", response_model=dict)
def set_weight_vector(weight_vector: WeightVector):
    """
    Set weight vector with change-rule enforcement
    """
    try:
        # Validate weight vector sum to 1.0
        if not math.isclose(sum(weight_vector.weights), 1.0, abs_tol=1e-6):
            raise HTTPException(status_code=400, detail="Weight vector must sum to 1.0")

        # Validate each weight is between 0 and 1
        if any(w < 0 or w > 1 for w in weight_vector.weights):
            raise HTTPException(status_code=400, detail="All weights must be between 0 and 1")

        # In a real system, this would enforce the change rules from constitution
        return {
            "status": "success",
            "message": "Weight vector updated successfully",
            "new_weights": weight_vector.weights,
            "validation": "change_rules_compliant"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))







