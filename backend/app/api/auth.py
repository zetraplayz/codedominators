import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from passlib.context import CryptContext  # type: ignore
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
        "employee_id": profile.employee_id,
        "role": profile.role,
        "department": profile.department.name if profile.department else None,
        "education": profile.education,
        "designation": profile.designation,
        "job_profile": profile.job_profile,
        "specialization": profile.specialization,
        "assigned_courses": profile.assigned_courses,
        "mobile_number": profile.mobile_number,
        "short_bio": profile.short_bio,
        "profile_photo": profile.profile_photo,
    }

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    department: Optional[str] = None
    education: Optional[str] = None
    designation: Optional[str] = None
    job_profile: Optional[str] = None
    specialization: Optional[str] = None
    assigned_courses: Optional[str] = None
    mobile_number: Optional[str] = None
    short_bio: Optional[str] = None
    profile_photo: Optional[str] = None

@router.put("/me")
def update_me(update_data: UserUpdate, profile: models.User = Depends(get_current_profile), db: Session = Depends(get_db)):
    if update_data.full_name is not None:
        profile.full_name = update_data.full_name  # type: ignore
    if update_data.department is not None:
        dept = db.query(models.Department).filter(models.Department.name == update_data.department).first()
        if not dept:
            dept = models.Department(name=update_data.department)
            db.add(dept)
            db.commit()
            db.refresh(dept)
        profile.department_id = dept.id  # type: ignore
    if update_data.education is not None:
        profile.education = update_data.education  # type: ignore
    if update_data.designation is not None:
        profile.designation = update_data.designation  # type: ignore
    if update_data.job_profile is not None:
        profile.job_profile = update_data.job_profile  # type: ignore
    if update_data.specialization is not None:
        profile.specialization = update_data.specialization  # type: ignore
    if update_data.assigned_courses is not None:
        profile.assigned_courses = update_data.assigned_courses  # type: ignore
    if update_data.mobile_number is not None:
        profile.mobile_number = update_data.mobile_number  # type: ignore
    if update_data.short_bio is not None:
        profile.short_bio = update_data.short_bio  # type: ignore
    if update_data.profile_photo is not None:
        profile.profile_photo = update_data.profile_photo  # type: ignore
    
    db.commit()
    db.refresh(profile)
    
    return {
        "id": profile.id,
        "email": profile.official_email,
        "name": profile.full_name,
        "employee_id": profile.employee_id,
        "role": profile.role,
        "department": profile.department.name if profile.department else None,
        "education": profile.education,
        "designation": profile.designation,
        "job_profile": profile.job_profile,
        "specialization": profile.specialization,
        "assigned_courses": profile.assigned_courses,
        "mobile_number": profile.mobile_number,
        "short_bio": profile.short_bio,
        "profile_photo": profile.profile_photo,
    }


@router.get("/notifications")
def get_notifications(profile: models.User = Depends(get_current_profile), db: Session = Depends(get_db)):
    """Get unread notifications + access request count for the current user."""
    notifs = db.query(models.Notification).filter(
        models.Notification.user_id == profile.id
    ).order_by(models.Notification.created_at.desc()).limit(20).all()
    
    # Count pending access requests (notifications sent TO this user asking for access)
    access_requests = db.query(models.Notification).filter(
        models.Notification.user_id == profile.id,
        models.Notification.type == "RESOURCE_ACCESS_REQUEST",
        models.Notification.is_read == False
    ).count()
    
    return {
        "notifications": [
            {
                "id": n.id,
                "type": n.type,
                "message": n.message,
                "is_read": n.is_read,
                "created_at": n.created_at.isoformat() if n.created_at else None,
                "metadata": n.metadata_obj
            }
            for n in notifs
        ],
        "unread_count": sum(1 for n in notifs if not n.is_read),
        "access_request_count": access_requests
    }


@router.post("/notifications/{notif_id}/read")
def mark_notification_read(notif_id: int, profile: models.User = Depends(get_current_profile), db: Session = Depends(get_db)):
    notif = db.query(models.Notification).filter(
        models.Notification.id == notif_id,
        models.Notification.user_id == profile.id
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True  # type: ignore
    db.commit()
    return {"detail": "Marked as read"}
