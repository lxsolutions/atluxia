




from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.core.config import settings
from app.core.database import get_db
from app.models import user as user_model
from app.schemas import user as user_schema

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/users/login")


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_user(db: Session, user_id: int) -> Optional[user_model.User]:
    return db.query(user_model.User).filter(user_model.User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> Optional[user_model.User]:
    return db.query(user_model.User).filter(user_model.User.email == email).first()


def get_user_by_username(db: Session, username: str) -> Optional[user_model.User]:
    return db.query(user_model.User).filter(user_model.User.username == username).first()


def get_user_by_oauth_provider(
    db: Session, provider: str, provider_id: str
) -> Optional[user_model.User]:
    return db.query(user_model.User).filter(
        user_model.User.google_id == provider_id if provider == "google" else
        user_model.User.github_id == provider_id
    ).first()


def get_users(
    db: Session, skip: int = 0, limit: int = 100
) -> list[user_model.User]:
    return db.query(user_model.User).offset(skip).limit(limit).all()


def create_user(db: Session, user: user_schema.UserCreate) -> user_model.User:
    hashed_password = get_password_hash(user.password)
    db_user = user_model.User(
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        hashed_password=hashed_password,
        favorite_factions=user.favorite_factions,
        wallet_address=user.wallet_address
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def create_oauth_user(
    db: Session, user: user_schema.UserCreate, oauth_data: user_schema.OAuthLogin
) -> user_model.User:
    db_user = user_model.User(
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        favorite_factions=user.favorite_factions,
        wallet_address=user.wallet_address,
        google_id=oauth_data.provider_id if oauth_data.provider == "google" else None,
        github_id=oauth_data.provider_id if oauth_data.provider == "github" else None,
        is_verified=True  # OAuth users are pre-verified
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(
    db: Session, user_id: int, user: user_schema.UserUpdate
) -> user_model.User:
    db_user = get_user(db, user_id)
    if db_user is None:
        return None
    
    update_data = user.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_user, field, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate_user(
    db: Session, email: str, password: str
) -> Optional[user_model.User]:
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def get_current_user(
    db: Session, token: str = Depends(security)
) -> user_model.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # First try regular games-api JWT authentication
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id: int = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        
        user = get_user(db, user_id=user_id)
        if user is None:
            raise credentials_exception
        return user
        
    except JWTError:
        # If regular authentication fails, try PolyVerse JWT authentication
        from app.core import security
        did = security.verify_token(token)
        if did is None:
            raise credentials_exception
        
        # Get or create user based on DID
        user = get_or_create_user_by_did(db, did)
        if user is None:
            raise credentials_exception
        
        return user


def update_last_login(db: Session, user_id: int):
    db_user = get_user(db, user_id)
    if db_user:
        db_user.last_login = datetime.utcnow()
        db.commit()


def link_wallet(db: Session, user_id: int, wallet_address: str):
    db_user = get_user(db, user_id)
    if db_user:
        db_user.wallet_address = wallet_address
        db.commit()


def get_or_create_user_by_did(db: Session, did: str) -> user_model.User:
    """
    Get or create a user based on PolyVerse DID.
    If user doesn't exist, creates a new user with the DID.
    """
    # First try to find user by DID
    user = db.query(user_model.User).filter(user_model.User.polyverse_did == did).first()
    
    if user:
        return user
    
    # If user doesn't exist, create a new one
    # Generate a username from DID (first 8 chars of hash)
    import hashlib
    username_hash = hashlib.sha256(did.encode()).hexdigest()[:8]
    username = f"polyverse_{username_hash}"
    
    # Create minimal user with DID
    db_user = user_model.User(
        email=f"{username}@polyverse.local",  # Placeholder email
        username=username,
        full_name="PolyVerse User",
        hashed_password="",  # No password for PolyVerse users
        polyverse_did=did,
        is_verified=True,    # PolyVerse users are considered verified
        is_active=True
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user


def get_current_user_polyverse(
    db: Session, token: str = Depends(security)
) -> user_model.User:
    """
    Dependency for PolyVerse JWT authentication.
    Extracts DID from token and gets/creates corresponding user.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate PolyVerse credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Verify PolyVerse token and extract DID
    from app.core import security
    did = security.verify_token(token)
    if did is None:
        raise credentials_exception
    
    # Get or create user based on DID
    user = get_or_create_user_by_did(db, did)
    if user is None:
        raise credentials_exception
    
    return user


def get_current_user_universal(
    db: Session, token: str = Depends(security)
) -> user_model.User:
    """
    Universal authentication dependency that tries both:
    1. Regular games-api JWT authentication
    2. PolyVerse JWT authentication (fallback)
    """
    try:
        # First try regular games-api authentication
        return get_current_user(db, token)
    except HTTPException:
        # If that fails, try PolyVerse authentication
        try:
            return get_current_user_polyverse(db, token)
        except HTTPException:
            # Both failed, raise authentication error
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )


def get_current_user_pydantic(
    db: Session = Depends(get_db), token: str = Depends(security)
) -> user_schema.User:
    """
    Dependency that returns a Pydantic User model instead of SQLAlchemy model.
    """
    db_user = get_current_user(db, token)
    return user_schema.User.from_orm(db_user)


