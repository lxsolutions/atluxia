


from typing import Any, Dict, List, Optional, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Tribute Battles"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:8080",
    ]

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Database
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "tribute_user"
    POSTGRES_PASSWORD: str = "tribute_password"
    POSTGRES_DB: str = "tribute_battles"
    DATABASE_URL: Optional[str] = None

    @validator("DATABASE_URL", pre=True)
    def assemble_db_connection(cls, v: Optional[str], values: Dict[str, Any]) -> Any:
        if isinstance(v, str):
            return v
        return f"postgresql://{values.get('POSTGRES_USER')}:{values.get('POSTGRES_PASSWORD')}@{values.get('POSTGRES_SERVER')}/{values.get('POSTGRES_DB')}"

    # Security - Use PolyVerse shared JWT configuration
    SECRET_KEY: str = "your-polyverse-jwt-secret-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30 * 24 * 60  # 30 days
    
    # PolyVerse JWT Configuration (overrides from environment)
    POLYVERSE_JWT_SECRET: str = "your-polyverse-jwt-secret-change-in-production"
    POLYVERSE_JWT_ALGORITHM: str = "HS256"

    # Stripe
    STRIPE_SECRET_KEY: str = "your-stripe-secret-key"
    STRIPE_PUBLISHABLE_KEY: str = "your-stripe-publishable-key"

    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    
    # PolyVerse Integration
    TRUTH_GRAPH_URL: str = "http://truth-graph:3004"
    INDEXER_URL: str = "http://indexer:3002"
    POLYVERSE_INTEGRATION_ENABLED: bool = True

    # MinIO/S3 Storage
    S3_ENDPOINT: str = "http://minio:9000"
    S3_ACCESS_KEY: str = "minioadmin"
    S3_SECRET_KEY: str = "minioadmin"
    S3_BUCKET_NAME: str = "tribute-proofs"
    S3_REGION: str = "us-east-1"
    MAX_UPLOAD_SIZE_MB: int = 100  # 100MB max file size
    ALLOWED_FILE_TYPES: List[str] = ["image/jpeg", "image/png", "image/gif", "video/mp4", "application/zip", "text/plain"]
    
    # Blockchain Configuration
    POLYGON_RPC_URL: str = "https://polygon-rpc.com"
    BASE_RPC_URL: str = "https://mainnet.base.org"
    SEPOLIA_RPC_URL: str = "https://sepolia.infura.io/v3/YOUR-PROJECT-ID"
    ESCROW_OWNER_ADDRESS: str = "0x0000000000000000000000000000000000000000"  # Set in production
    ESCROW_CONTRACT_ADDRESS: Optional[str] = None

    class Config:
        case_sensitive = True


settings = Settings()


