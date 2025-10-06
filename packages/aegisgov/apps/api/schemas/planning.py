











from pydantic import BaseModel
from typing import List, Dict, Any
from .tasks import PlanningTask
from .explainer import PlanExplainer

class ParetoOption(BaseModel):
    action_type: str
    profit: float
    social_impact: float
    risk: float

class ChosenPlan(BaseModel):
    action_type: str
    explanation: str
    tradeoffs: List[Dict[str, Any]]
    explainer: PlanExplainer = None  # Optional field for detailed explainer

class PlanningResponse(BaseModel):
    pareto_set: List[ParetoOption]
    chosen_plan: ChosenPlan














