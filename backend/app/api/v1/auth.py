from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserLogin
from app.core.security import get_password_hash, verify_password

# ---- NEW imports (sirf add kiye gaye) ----
from fastapi.security import OAuth2PasswordRequestForm
from app.core.security import create_access_token
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    # 1. Check if email is already registered
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered."
        )
    
    # 2. Securely hash the plain text password
    secure_hash = get_password_hash(user_in.password)
    
    # 3. Create a new user instance
    new_user = User(
        full_name=user_in.full_name,
        email=user_in.email,
        password_hash=secure_hash,
        role="user"
    )
    
    # 4. Save to local SQLite database
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.post("/login", status_code=status.HTTP_200_OK)
def login_user(user_in: UserLogin, db: Session = Depends(get_db)):
    # 1. Fetch user by email from database
    user = db.query(User).filter(User.email == user_in.email).first()
    
    # 2. If user not found, raise unauthorized error
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please try again."
        )
    
    # 3. Verify standard hashed password string match
    is_valid_password = verify_password(user_in.password, user.password_hash)
    if not is_valid_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please try again."
        )
        
    # 4. Toast-ready English success notification mapping
    return {
        "message": "Login successful.",
        "access_token": create_access_token(user.id),   # NEW
        "token_type": "bearer",                          # NEW
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role
        }
    }


# ======================= NEW ENDPOINTS (neeche sab naya hai) =======================

@router.post("/token")
def login_for_swagger(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """Form-based login. Used only by the Authorize button in /docs."""
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please try again."
        )
    return {
        "access_token": create_access_token(user.id),
        "token_type": "bearer",
    }


@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)):
    """Return the currently logged-in user. Requires a valid Bearer token."""
    return current_user