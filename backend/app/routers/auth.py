from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import UserRegister, UserLogin
from ..auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(data: UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this email already exists"
        )

    new_user = User(
        name=data.name,
        email=data.email,
        password=hash_password(data.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully"}

@router.post("/login")
def login(data: UserLogin, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    token = create_access_token({
        "userId": user.id,
        "email": user.email,
        "name": user.name
    })

    # Set HTTP-only cookie valid for 7 days
    response.set_cookie(
        key="token",
        value=token,
        httponly=True,
        max_age=7 * 24 * 3600,
        path="/",
        samesite="lax",
        secure=False
    )

    return {
        "message": "Logged in successfully",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        },
        "token": token
    }

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="token", path="/")
    return {"message": "Logged out successfully"}

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "createdAt": current_user.created_at.isoformat() if current_user.created_at else None
        }
    }
