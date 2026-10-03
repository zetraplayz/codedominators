from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
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

@router.delete("/departments/{dept_id}")
def delete_department(dept_id: int, db: Session = Depends(get_db), admin: models.User = Depends(get_current_admin)):
    dept = db.query(models.Department).filter(models.Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    # Unassign users first
    db.query(models.User).filter(models.User.department_id == dept_id).update({"department_id": None})
    db.delete(dept)
    db.commit()
    return {"detail": "Department deleted"}

# -----------------
# USERS
# -----------------

class UserCreate(BaseModel):
    full_name: str
    email: str
    employee_id: str
    password: str
    role: str
    department_id: Optional[int] = None

class UserRoleUpdate(BaseModel):
    role: str
    department_id: Optional[int] = None

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
        "department_name": u.department.name if u.department else None,
        "designation": u.designation,
        "profile_photo": u.profile_photo,
        "created_at": u.created_at.isoformat() if u.created_at else None
    } for u in users]

@router.post("/users")
def create_user(user: UserCreate, db: Session = Depends(get_db), admin: models.User = Depends(get_current_admin)):
    if not user.email.endswith("@ritrjpm.ac.in"):
        raise HTTPException(status_code=400, detail="Only @ritrjpm.ac.in institutional emails are allowed.")
        
    if user.role not in ["ADMIN", "HOD", "STAFF"]:
        raise HTTPException(status_code=400, detail="Role must be ADMIN, HOD, or STAFF")

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


@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: str,
    update: UserRoleUpdate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin)
):
    """Change a user's role or department. ADMIN cannot demote themselves."""
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="You cannot change your own role.")
    
    if update.role not in ["ADMIN", "HOD", "STAFF"]:
        raise HTTPException(status_code=400, detail="Role must be ADMIN, HOD, or STAFF")
    
    target = db.query(models.User).filter(models.User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    
    target.role = update.role  # type: ignore
    if update.department_id is not None:
        target.department_id = update.department_id  # type: ignore
    
    db.commit()
    return {"detail": "User role updated", "user_id": user_id, "role": update.role}


@router.delete("/users/{user_id}")
def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin)
):
    """Permanently delete a user account (Admin cannot delete themselves)."""
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="You cannot delete your own account.")
    
    target = db.query(models.User).filter(models.User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(target)
    db.commit()
    return {"detail": f"User {target.full_name} deleted successfully."}


# -----------------
# SYSTEM SETTINGS
# -----------------

class SystemSettingUpdate(BaseModel):
    key: str
    value: str

# GET is now protected — only authenticated users can read settings
# (non-admins can read, but only admins can write)
@router.get("/settings")
def get_system_settings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_profile)
):
    """Read system settings. Any authenticated user may read (for maintenance gate check)."""
    settings = db.query(models.SystemSettings).all()
    return {s.key: s.value for s in settings}

@router.post("/settings")
def update_system_setting(
    setting: SystemSettingUpdate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin)
):
    """Update a system setting. ADMIN only."""
    ALLOWED_KEYS = {
        "MAINTENANCE_MODE", "DEVELOPER_MODE", "DEV_MODE_ANNOUNCEMENT",
        "PATCH_NOTE_VERSION", "PATCH_NOTE_CONTENT",
        "TURN_SERVER_URL", "TURN_SERVER_USERNAME", "TURN_SERVER_PASSWORD"
    }
    if setting.key not in ALLOWED_KEYS:
        raise HTTPException(status_code=400, detail=f"Unknown setting key. Allowed: {', '.join(ALLOWED_KEYS)}")
    
    existing = db.query(models.SystemSettings).filter(models.SystemSettings.key == setting.key).first()
    if existing:
        existing.value = setting.value  # type: ignore
    else:
        new_setting = models.SystemSettings(key=setting.key, value=setting.value)
        db.add(new_setting)
    db.commit()
    return {"message": "Setting updated", "key": setting.key, "value": setting.value}


# -----------------
# AUDIT / OVERVIEW STATS
# -----------------

@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin)
):
    """Quick stats for the admin overview panel."""
    total_users = db.query(models.User).count()
    total_resources = db.query(models.Resource).count()
    total_departments = db.query(models.Department).count()
    pending_access = db.query(models.Notification).filter(
        models.Notification.type == "RESOURCE_ACCESS_REQUEST",
        models.Notification.is_read == False
    ).count()
    
    role_breakdown = {}
    for role in ["ADMIN", "HOD", "STAFF"]:
        role_breakdown[role] = db.query(models.User).filter(models.User.role == role).count()

    return {
        "total_users": total_users,
        "total_resources": total_resources,
        "total_departments": total_departments,
        "pending_access_requests": pending_access,
        "role_breakdown": role_breakdown
    }
