from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app import models
from app.schemas import resource as resource_schema

router = APIRouter()

# Note: In a real app, you would have a `get_current_user` dependency.
# For now, we will simulate a mock user_id in headers or just pass it in requests.

@router.post("/", response_model=resource_schema.Resource)
def create_resource(
    resource: resource_schema.ResourceCreate,
    owner_id: str, # Simulating logged in user
    db: Session = Depends(get_db)
):
    # Ensure user exists (Mock check)
    user = db.query(models.User).filter(models.User.id == owner_id).first()
    if not user:
        # Create a mock user if they don't exist in local DB (sync from Supabase auth)
        user = models.User(id=owner_id, full_name="Mock User", employee_id=owner_id, official_email=f"{owner_id}@institution.edu")
        db.add(user)
        db.commit()

    db_resource = models.Resource(
        title=resource.title,
        description=resource.description,
        visibility=resource.visibility,
        owner_id=owner_id
    )
    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)
    return db_resource

@router.get("/", response_model=List[resource_schema.Resource])
def list_resources(
    skip: int = 0, limit: int = 100,
    db: Session = Depends(get_db)
):
    resources = db.query(models.Resource).offset(skip).limit(limit).all()
    return resources

@router.get("/{resource_id}", response_model=resource_schema.Resource)
def get_resource(resource_id: int, db: Session = Depends(get_db)):
    resource = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if resource is None:
        raise HTTPException(status_code=404, detail="Resource not found")
    return resource

@router.post("/{resource_id}/versions", response_model=resource_schema.ResourceVersion)
def create_resource_version(
    resource_id: int,
    version: resource_schema.ResourceVersionCreate,
    user_id: str,
    db: Session = Depends(get_db)
):
    resource = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
        
    db_version = models.ResourceVersion(
        resource_id=resource_id,
        version_number=version.version_number,
        storage_path=version.storage_path,
        checksum=version.checksum,
        file_size=version.file_size,
        mime_type=version.mime_type,
        change_note=version.change_note,
        status=version.status,
        created_by=user_id
    )
    db.add(db_version)
    db.commit()
    db.refresh(db_version)
    return db_version
