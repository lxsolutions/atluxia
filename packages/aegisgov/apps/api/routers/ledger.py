














from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any

router = APIRouter(
    prefix="/ledger",
    tags=["ledger"],
    responses={404: {"description": "Not found"}}
)

class Decision(BaseModel):
    decision_id: int
    ts: str
    inputs_bundle: Dict[str, Any]
    objectives: Dict[str, float]
    options_considered: List[Dict[str, Any]]
    chosen_action: Dict[str, Any]
    tests_passed: Dict[str, bool]
    approvals: Dict[str, Any] = None
    appeals: Dict[str, Any] = None
    post_hoc_metrics: Dict[str, float] = None

class PaginatedDecisions(BaseModel):
    total: int
    page: int
    page_size: int
    decisions: List[Decision]

@router.get("/decisions", response_model=PaginatedDecisions)
def get_decisions(page: int = 1, page_size: int = 10):
    """
    Get paginated list of decisions from the ledger
    """
    try:
        # In a real system, this would query the database
        # For demo purposes, return mock data
        mock_decisions = [
            Decision(
                decision_id=1,
                ts="2023-01-01T12:00:00Z",
                inputs_bundle={"kpi_data": {"unemployment": 5.0}},
                objectives={"rights_protection": 1.0, "prosperity": 0.8},
                options_considered=[],
                chosen_action={"action_type": "carbon_fee"},
                tests_passed={"constitution_check": True}
            ),
            Decision(
                decision_id=2,
                ts="2023-01-02T12:00:00Z",
                inputs_bundle={"kpi_data": {"unemployment": 4.8}},
                objectives={"rights_protection": 1.0, "prosperity": 0.85},
                options_considered=[],
                chosen_action={"action_type": "housing_credits"},
                tests_passed={"constitution_check": True}
            )
        ]

        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size

        return PaginatedDecisions(
            total=len(mock_decisions),
            page=page,
            page_size=page_size,
            decisions=mock_decisions[start_idx:end_idx]
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))








