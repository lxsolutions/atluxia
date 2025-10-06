





from fastapi import APIRouter
from app.api.api_v1.endpoints import users, disputes, games, leaderboards, payments, subscriptions

api_router = APIRouter()
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(disputes.router, prefix="/disputes", tags=["disputes"])
api_router.include_router(games.router, prefix="/games", tags=["games"])
api_router.include_router(leaderboards.router, prefix="/leaderboards", tags=["leaderboards"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
api_router.include_router(subscriptions.router, prefix="/subscriptions", tags=["subscriptions"])


