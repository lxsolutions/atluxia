










from pydantic import BaseModel
from typing import List, Dict

class Task(BaseModel):
    task_id: int
    description: str
    profit: float
    social_impact: float
    risk: float
    hours_required: int
    score: float = None  # Optional field for calculated scores

class PlanningTask(BaseModel):
    action_type: str
    profit: float
    social_impact: float
    risk: float














