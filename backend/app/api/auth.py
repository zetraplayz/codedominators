import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from app.core.database import get_db
from app import models
from app.core.auth import create_access_token
from typing import Optional

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    employee_id: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

def verify_password(plain_password, hashed_password):
    if not hashed_password:
        return False
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

@router.post("/register")
def register(user_in: UserRegister, response: Response, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(
        (models.User.official_email == user_in.email) |
        (models.User.employee_id == user_in.employee_id)
    ).first()
    
    if user:
        raise HTTPException(status_code=400, detail="User with this email or employee ID already exists")
    
    user_id = str(uuid.uuid4())
    db_user = models.User(
        id=user_id,
        full_name=user_in.full_name,
        official_email=user_in.email,
        employee_id=user_in.employee_id,
        password_hash=get_password_hash(user_in.password),
        role="STAFF"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    token = create_access_token({"sub": db_user.id})
    response.set_cookie(key="cp_session", value=token, httponly=True, path="/", max_age=7*24*60*60)
    return {"access_token": token, "token_type": "bearer", "user": {"id": db_user.id, "email": db_user.official_email}}

@router.post("/login")
def login(user_in: UserLogin, response: Response, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.official_email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = create_access_token({"sub": user.id})
    response.set_cookie(key="cp_session", value=token, httponly=True, path="/", max_age=7*24*60*60)
    return {"access_token": token, "token_type": "bearer", "user": {"id": user.id, "email": user.official_email}}

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("cp_session", path="/")
    return {"message": "Logged out successfully"}

from app.core.auth import get_current_profile

@router.get("/me")
def get_me(profile: models.User = Depends(get_current_profile)):
    return {
        "id": profile.id,
        "email": profile.official_email,
        "name": profile.full_name,
        "role": profile.role,
        "department": profile.department,
        "education": profile.education
    }

class UserUpdate(BaseModel):
    department: Optional[str] = None
    education: Optional[str] = None
    role: Optional[str] = None
    profile_photo: Optional[str] = None

@router.put("/me")
def update_me(update_data: UserUpdate, profile: models.User = Depends(get_current_profile), db: Session = Depends(get_db)):
    if update_data.department is not None:
        profile.department = update_data.department
    if update_data.education is not None:
        profile.education = update_data.education
    if update_data.role is not None:
        profile.role = update_data.role
    if update_data.profile_photo is not None:
        profile.profile_photo = update_data.profile_photo
    
    db.commit()
    db.refresh(profile)
    
    return {
        "id": profile.id,
        "email": profile.official_email,
        "name": profile.full_name,
        "role": profile.role,
        "department": profile.department,
        "education": profile.education,
        "profile_photo": profile.profile_photo
    }
