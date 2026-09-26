from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app import models
from app.api.auth import get_current_profile

router = APIRouter()

class KitCreate(BaseModel):
    name: str
    subject: str

class KitResourceAdd(BaseModel):
    resource_id: int

@router.get("/")
@router.get("")
def list_kits(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_profile)):
    # Fetch kits owned by user or shared within dept/institution
    # For now, just return all kits the user owns or that are public/dept discoverable
    kits = db.query(models.TeachingKit).all()
    
    result = []
    for kit in kits:
        if kit.owner_id != current_user.id:
            if kit.visibility == "PRIVATE":
                continue
            elif kit.visibility == "DEPARTMENT_DISCOVERABLE":
                owner = db.query(models.User).filter(models.User.id == kit.owner_id).first()
                if owner and owner.department_id != current_user.department_id:
                    continue
            elif kit.visibility == "INSTITUTION_DISCOVERABLE":
                pass
            else:
                continue
        resource_count = db.query(func.count(models.TeachingKitResource.id)).filter(
            models.TeachingKitResource.kit_id == kit.id
        ).scalar()

        result.append({
            "id": kit.id,
            "name": kit.name,
            "subject": kit.subject,
            "visibility": kit.visibility,
            "resourceCount": resource_count,
            "lastUpdated": kit.updated_at.isoformat() if kit.updated_at else kit.created_at.isoformat()
        })
    
    # Sort by recent first
    result.sort(key=lambda x: x["lastUpdated"], reverse=True)
    return result

@router.post("/")
@router.post("")
def create_kit(kit: KitCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_profile)):
    new_kit = models.TeachingKit(
        name=kit.name,
        subject=kit.subject,
        owner_id=current_user.id,
        visibility="PRIVATE"
    )
    db.add(new_kit)
    db.commit()
    db.refresh(new_kit)
    
    return {
        "id": new_kit.id,
        "name": new_kit.name,
        "subject": new_kit.subject,
        "visibility": new_kit.visibility,
        "resourceCount": 0,
        "lastUpdated": new_kit.updated_at.isoformat() if new_kit.updated_at else new_kit.created_at.isoformat()
    }

@router.post("/{kit_id}/resources")
def add_resource_to_kit(kit_id: int, req: KitResourceAdd, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_profile)):
    kit = db.query(models.TeachingKit).filter(models.TeachingKit.id == kit_id, models.TeachingKit.owner_id == current_user.id).first()
    if not kit:
        raise HTTPException(status_code=404, detail="Kit not found or not authorized")
        
    resource = db.query(models.Resource).filter(models.Resource.id == req.resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
        
    if resource.owner_id != current_user.id and resource.visibility == "PRIVATE":
        raise HTTPException(status_code=403, detail="Forbidden. You do not have permission to use this resource.")
        
    existing = db.query(models.TeachingKitResource).filter(
        models.TeachingKitResource.kit_id == kit_id,
        models.TeachingKitResource.resource_id == req.resource_id
    ).first()
    
    if existing:
        return {"status": "ok", "message": "Already added"}
        
    kit_res = models.TeachingKitResource(kit_id=kit_id, resource_id=req.resource_id)
    db.add(kit_res)
    db.commit()
    return {"status": "ok", "message": "Added to kit"}


@router.get("/{kit_id}")
def get_kit_details(kit_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_profile)):
    kit = db.query(models.TeachingKit).filter(models.TeachingKit.id == kit_id).first()
    if not kit:
        raise HTTPException(status_code=404, detail="Kit not found")
        
    if kit.owner_id != current_user.id:
        if kit.visibility == "PRIVATE":
            raise HTTPException(status_code=403, detail="Not authorized to view this kit")
        elif kit.visibility == "DEPARTMENT_DISCOVERABLE":
            owner = db.query(models.User).filter(models.User.id == kit.owner_id).first()
            if owner and owner.department_id != current_user.department_id:
                raise HTTPException(status_code=403, detail="Not authorized to view this department's kit")
        
    # Get resources
    kit_resources = db.query(models.TeachingKitResource).filter(models.TeachingKitResource.kit_id == kit_id).all()
    resource_ids = [kr.resource_id for kr in kit_resources]
    
    resources = db.query(models.Resource).filter(models.Resource.id.in_(resource_ids)).all() if resource_ids else []
    
    return {
        "id": kit.id,
        "name": kit.name,
        "subject": kit.subject,
        "visibility": kit.visibility,
        "owner_id": kit.owner_id,
        "lastUpdated": kit.updated_at.isoformat() if kit.updated_at else kit.created_at.isoformat(),
        "resources": [
            {
                "id": r.id,
                "title": r.title,
                "description": r.description,
                "visibility": r.visibility,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in resources
        ]
    }

@router.delete("/{kit_id}")
def delete_kit(kit_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_profile)):
    kit = db.query(models.TeachingKit).filter(models.TeachingKit.id == kit_id, models.TeachingKit.owner_id == current_user.id).first()
    if not kit:
        raise HTTPException(status_code=404, detail="Kit not found or not owned by you")
    
    # Clean up associated kit resources
    db.query(models.TeachingKitResource).filter(models.TeachingKitResource.kit_id == kit_id).delete()
    
    db.delete(kit)
    db.commit()
    return {"detail": "Kit deleted"}
