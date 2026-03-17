from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, get_current_user
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest, AuthResponse, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])

def user_to_out(user: User) -> UserOut:
    return UserOut(
        id=user.id,
        name=user.name,
        email=user.email,
        targetExam=user.target_exam,
        createdAt=user.created_at,
    )

@router.post("/register", response_model=AuthResponse)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        name=body.name,
        email=body.email,
        hashed_password=hash_password(body.password),
        target_exam=body.targetExam,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": str(user.id)})
    return AuthResponse(token=token, user=user_to_out(user))

@router.post("/login", response_model=AuthResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": str(user.id)})
    return AuthResponse(token=token, user=user_to_out(user))

@router.post("/logout")
def logout():
    # JWT is stateless — client just drops the token
    return {"message": "Logged out"}

@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return user_to_out(current_user)
