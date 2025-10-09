from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import create_db_and_tables
from app.routers import auth, users, path, catalog, assessments, jobs, artifacts, parent

app = FastAPI(
    title="EverPath API",
    description="Career & Education Pathing Engine",
    version="0.1.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(path.router, prefix="/path", tags=["path"])
app.include_router(catalog.router, prefix="/catalog", tags=["catalog"])
app.include_router(assessments.router, prefix="/assessments", tags=["assessments"])
app.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
app.include_router(artifacts.router, prefix="/artifacts", tags=["artifacts"])
app.include_router(parent.router, prefix="/parent", tags=["parent"])


@app.on_event("startup")
def on_startup():
    """Initialize database on startup."""
    create_db_and_tables()


@app.get("/")
def read_root():
    return {"message": "Welcome to EverPath API", "version": "0.1.0"}


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "everpath-api"}