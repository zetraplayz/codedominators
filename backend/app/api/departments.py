from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app import models
from app.api.auth import get_current_profile

router = APIRouter()

@router.get("/")
def get_department_members(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_profile)):
    if not current_user.department_id:
        return []
        
    members = db.query(models.User).filter(
        models.User.department_id == current_user.department_id
    ).all()
    
    result = []
    for member in members:
        result.append({
            "id": member.id,
            "name": member.full_name,
            "email": member.official_email,
            "role": member.role,
            "designation": member.designation,
            "profile_photo": member.profile_photo,
        })
        
    return result

@router.get("/resources")
def get_department_resources(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_profile)):
    if not current_user.department_id:
        return []
        
    if current_user.role == "HOD":
        # HOD can view all resources in their department
        resources = db.query(models.Resource).join(models.User).filter(
            models.User.department_id == current_user.department_id
        ).all()
    else:
        # STAFF can view non-private resources in their department, or their own
        from sqlalchemy import or_
        resources = db.query(models.Resource).join(models.User).filter(
            models.User.department_id == current_user.department_id,
            or_(
                models.Resource.visibility != "PRIVATE",
                models.Resource.owner_id == current_user.id
            )
        ).all()
    
    result = []
    for r in resources:
        result.append({
            "id": r.id,
            "title": r.title,
            "description": r.description,
            "visibility": r.visibility,
            "created_at": r.created_at.isoformat(),
            "owner_id": r.owner_id,
            "owner_name": r.owner.full_name,
            "owner_photo": r.owner.profile_photo,
        })
        
    return result
