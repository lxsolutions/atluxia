










from fastapi import FastAPI
from .routers import planning, orders, appeals, ledger, weights

app = FastAPI(
    title="AegisGov API",
    description="AI Higher-Governance System for Income-Producing, Socially Beneficial Orders",
    version="0.2"
)

# Include routers
app.include_router(planning.router)
app.include_router(orders.router)
app.include_router(appeals.router)
app.include_router(ledger.router)
app.include_router(weights.router)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to AegisGov v0.2",
        "status": "running",
        "available_endpoints": [
            "/plan/run",
            "/orders/daily",
            "/appeals/file",
            "/ledger/decisions",
            "/weights/set"
        ]
    }





