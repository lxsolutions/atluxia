











from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any

router = APIRouter(
    prefix="/plan",
    tags=["planning"],
    responses={404: {"description": "Not found"}}
)

class PlanningRequest(BaseModel):
    weight_vector: List[float]
    region: str = "denver_boulder"
    hours_available: int = 6

class ParetoOption(BaseModel):
    action_type: str
    profit: float
    social_impact: float
    risk: float

class ChosenPlan(BaseModel):
    action_type: str
    explanation: str
    tradeoffs: List[Dict[str, Any]]

class PlanningResponse(BaseModel):
    pareto_set: List[ParetoOption]
    chosen_plan: ChosenPlan

@router.post("/run", response_model=PlanningResponse)
def run_planning_cycle(request: PlanningRequest):
    """
    Run planning cycle in shadow mode and return Pareto set and chosen plan explainer
    """
    try:
        # In a real system, this would:
        # 1. Load KPI data for the region
        # 2. Generate Pareto frontier
        # 3. Validate against constitution
        # 4. Run assurance monitors

        # For demo purposes, return mock response
        pareto_set = [
            ParetoOption(
                action_type="carbon_fee_dividend",
                profit=500000,
                social_impact=0.8,
                risk=1.2
            ),
            ParetoOption(
                action_type="housing_build_credits",
                profit=300000,
                social_impact=0.9,
                risk=1.5
            )
        ]

        chosen_plan = ChosenPlan(
            action_type="carbon_fee_dividend",
            explanation="Maximizes profit while maintaining high social impact",
            tradeoffs=[
                {"option": "housing_build_credits", "score": 0.85}
            ]
        )

        return PlanningResponse(
            pareto_set=pareto_set,
            chosen_plan=chosen_plan
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))





