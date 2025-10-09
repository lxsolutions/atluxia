






















from pydantic import BaseModel
from typing import List, Dict, Any

class Explainer(BaseModel):
    weight_vector: List[float]
    chosen_plan: Dict[str, Any]
    tradeoffs: List[Dict[str, float]]
    thresholds_met: bool
    rollback_plan: str

class Tradeoff(BaseModel):
    option: str
    score_diff_pct: float
























