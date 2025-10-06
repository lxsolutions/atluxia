



from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.security import get_password_hash, verify_password
from app.core.database import get_db
from app.models import user as user_model
from app.schemas import user as user_schema
from app.crud import user as user_crud

router = APIRouter()


@router.post("/", response_model=user_schema.User)
def create_user(
    user: user_schema.UserCreate,
    db: Session = Depends(get_db)
):
    db_user = user_crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    db_user = user_crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Username already taken"
        )
    return user_crud.create_user(db=db, user=user)


@router.get("/", response_model=List[user_schema.User])
def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    users = user_crud.get_users(db, skip=skip, limit=limit)
    return users


@router.get("/{user_id}", response_model=user_schema.User)
def read_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    db_user = user_crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@router.put("/{user_id}", response_model=user_schema.User)
def update_user(
    user_id: int,
    user: user_schema.UserUpdate,
    db: Session = Depends(get_db)
):
    db_user = user_crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user_crud.update_user(db=db, user_id=user_id, user=user)


@router.post("/login", response_model=user_schema.Token)
def login(
    user_credentials: user_schema.UserLogin,
    db: Session = Depends(get_db)
):
    user = user_crud.authenticate_user(
        db, email=user_credentials.email, password=user_credentials.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = user_crud.create_access_token(
        data={"sub": str(user.id)}
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/oauth", response_model=user_schema.Token)
def oauth_login(
    oauth_data: user_schema.OAuthLogin,
    db: Session = Depends(get_db)
):
    # Check if user exists with OAuth provider ID
    user = user_crud.get_user_by_oauth_provider(
        db, provider=oauth_data.provider, provider_id=oauth_data.provider_id
    )
    
    if not user:
        # Create new user
        user_create = user_schema.UserCreate(
            email=oauth_data.email,
            username=oauth_data.username,
            full_name=oauth_data.full_name,
            password=None  # OAuth users don't have passwords
        )
        user = user_crud.create_oauth_user(db=db, user=user_create, oauth_data=oauth_data)
    
    # Update last login
    user_crud.update_last_login(db, user_id=user.id)
    
    access_token = user_crud.create_access_token(
        data={"sub": str(user.id)}
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=user_schema.User)
def read_users_me(
    current_user: user_model.User = Depends(user_crud.get_current_user)
):
    return current_user


@router.post("/link-wallet")
def link_wallet(
    wallet_address: str,
    current_user: user_model.User = Depends(user_crud.get_current_user)
):
    user_crud.link_wallet(db, user_id=current_user.id, wallet_address=wallet_address)
    return {"message": "Wallet linked successfully"}



