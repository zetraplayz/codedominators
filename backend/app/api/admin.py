from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app import models
from app.api.auth import get_current_profile, verify_password, get_password_hash
import uuid

router = APIRouter()

# Middleware-like dependency to ensure ADMIN access
def get_current_admin(current_user: models.User = Depends(get_current_profile)):
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user

# -----------------
# DEPARTMENTS
# -----------------

class DepartmentCreate(BaseModel):
    name: str

@router.get("/departments")
def get_all_departments(db: Session = Depends(get_db), admin: models.User = Depends(get_current_admin)):
    departments = db.query(models.Department).all()
    return [{"id": d.id, "name": d.name, "hod_id": d.hod_id} for d in departments]

@router.post("/departments")
def create_department(dept: DepartmentCreate, db: Session = Depends(get_db), admin: models.User = Depends(get_current_admin)):
    existing = db.query(models.Department).filter(models.Department.name == dept.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Department already exists")
    
    new_dept = models.Department(name=dept.name)
    db.add(new_dept)
    db.commit()
    db.refresh(new_dept)
    return {"id": new_dept.id, "name": new_dept.name}

# -----------------
# USERS
# -----------------

class UserCreate(BaseModel):
    full_name: str
    email: str
    employee_id: str
    password: str
    role: str
    department_id: int | None = None

@router.get("/users")
def get_all_users(db: Session = Depends(get_db), admin: models.User = Depends(get_current_admin)):
    users = db.query(models.User).all()
    return [{
        "id": u.id,
        "full_name": u.full_name,
        "email": u.official_email,
        "employee_id": u.employee_id,
        "role": u.role,
        "department_id": u.department_id,
        "department_name": u.department.name if u.department else None
    } for u in users]

@router.post("/users")
def create_user(user: UserCreate, db: Session = Depends(get_db), admin: models.User = Depends(get_current_admin)):
    existing = db.query(models.User).filter(
        (models.User.official_email == user.email) | 
        (models.User.employee_id == user.employee_id)
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="User with email or employee ID already exists")
        
    new_user = models.User(
        id=str(uuid.uuid4()),
        full_name=user.full_name,
        official_email=user.email,
        employee_id=user.employee_id,
        password_hash=get_password_hash(user.password),
        role=user.role,
        department_id=user.department_id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"id": new_user.id, "full_name": new_user.full_name, "role": new_user.role}
