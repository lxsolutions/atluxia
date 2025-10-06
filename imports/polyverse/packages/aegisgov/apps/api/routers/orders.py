












from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

router = APIRouter(
    prefix="/orders",
    tags=["orders"],
    responses={404: {"description": "Not found"}}
)

class DailyOrdersRequest(BaseModel):
    hours_today: int
    weight_profile: str = "baseline"

class Order(BaseModel):
    task_id: int
    description: str
    profit: float
    social_impact: float
    risk: float
    hours_required: int
    score: float
    why_not_plan_b: str

@router.post("/daily", response_model=List[Order])
def generate_daily_orders(request: DailyOrdersRequest):
    """
    Generate Solo-Reporter orders for a given profile and available hours
    """
    try:
        # In a real system, this would:
        # 1. Load tasks from database or queue
        # 2. Score each task based on profit, social impact, risk
        # 3. Select top tasks that fit available hours

        # For demo purposes, return mock response
        sample_tasks = [
            {
                "task_id": 1,
                "description": "Implement carbon fee",
                "profit": 500000,
                "social_impact": 0.8,
                "risk": 1.2,
                "hours_required": 4
            },
            {
                "task_id": 3,
                "description": "Optimize public transit",
                "profit": 200000,
                "social_impact": 0.7,
                "risk": 1.0,
                "hours_required": 2
            }
        ]

        # Calculate scores (simplified)
        orders = []
        for task in sample_tasks:
            score = 0.5 * (task['profit'] / 100000) + 0.3 * task['social_impact'] - 0.2 * task['risk']
            why_not_plan_b = "Housing credits have higher social impact but lower profit"

            orders.append(Order(
                **task,
                score=score,
                why_not_plan_b=why_not_plan_b
            ))

        # Filter to fit available hours
        total_hours = sum(order.hours_required for order in orders)
        if total_hours > request.hours_today:
            # Simple greedy selection (in real system would use more sophisticated algorithm)
            selected_orders = []
            remaining_hours = request.hours_today

            for order in sorted(orders, key=lambda x: x.score, reverse=True):
                if order.hours_required <= remaining_hours:
                    selected_orders.append(order)
                    remaining_hours -= order.hours_required
                if remaining_hours == 0:
                    break

        else:
            selected_orders = orders

        return selected_orders

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))






