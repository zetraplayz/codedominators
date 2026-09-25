import os
import hashlib
import shutil
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from supabase import create_client, Client

from app.core.database import get_db
from app import models
from app.schemas import resource as resource_schema

router = APIRouter()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
STORAGE_BUCKET = "resources"

# Local uploads fallback dir (used if Supabase storage fails)
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


def get_supabase() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def upload_to_supabase_storage(user_id: str, resource_id: int, file: UploadFile) -> str:
    """Upload file to Supabase Storage and return the storage path."""
    supabase = get_supabase()
    file_bytes = file.file.read()
    storage_path = f"{user_id}/{resource_id}/{file.filename}"
    supabase.storage.from_(STORAGE_BUCKET).upload(
        path=storage_path,
        file=file_bytes,
        file_options={"content-type": file.content_type or "application/octet-stream"}
    )
    return storage_path


@router.post("/", response_model=resource_schema.Resource)
def create_resource(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    visibility: str = Form("PRIVATE"),
    owner_id: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Ensure user exists in local DB
    user = db.query(models.User).filter(models.User.id == owner_id).first()
    if not user:
        user = models.User(
            id=owner_id,
            full_name="Faculty Member",
            employee_id=owner_id,
            official_email=f"{owner_id}@institution.edu"
        )
        db.add(user)
        db.commit()

    # Create resource record first (to get the ID)
    db_resource = models.Resource(
        title=title,
        description=description,
        visibility=visibility,
        owner_id=owner_id
    )
    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)

    # Read file content for checksum
    file_bytes = file.file.read()
    file_size = len(file_bytes)
    checksum = hashlib.md5(file_bytes).hexdigest()

    # Try Supabase Storage, fall back to local
    storage_path = None
    if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY:
        try:
            supabase = get_supabase()
            remote_path = f"{owner_id}/{db_resource.id}/{file.filename}"
            supabase.storage.from_(STORAGE_BUCKET).upload(
                path=remote_path,
                file=file_bytes,
                file_options={"content-type": file.content_type or "application/octet-stream"}
            )
            storage_path = remote_path
        except Exception as e:
            print(f"[WARN] Supabase Storage upload failed: {e}. Falling back to local.")

    if not storage_path:
        local_path = os.path.join(UPLOAD_DIR, f"{db_resource.id}_{file.filename}")
        with open(local_path, "wb") as f:
            f.write(file_bytes)
        storage_path = local_path

    # Create version 1 (immutable)
    db_version = models.ResourceVersion(
        resource_id=db_resource.id,
        version_number=1,
        storage_path=storage_path,
        file_size=file_size,
        mime_type=file.content_type,
        checksum=checksum,
        status="PUBLISHED",
        created_by=owner_id
    )
    db.add(db_version)
    db.commit()
    db.refresh(db_resource)
    return db_resource


@router.get("/", response_model=List[resource_schema.Resource])
def list_resources(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    resources = db.query(models.Resource).offset(skip).limit(limit).all()
    return resources


@router.get("/{resource_id}", response_model=resource_schema.Resource)
def get_resource(resource_id: int, db: Session = Depends(get_db)):
    resource = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    return resource


@router.delete("/{resource_id}")
def delete_resource(
    resource_id: int,
    owner_id: str,
    db: Session = Depends(get_db)
):
    resource = db.query(models.Resource).filter(
        models.Resource.id == resource_id,
        models.Resource.owner_id == owner_id
    ).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found or not owned by you")
    db.delete(resource)
    db.commit()
    return {"detail": "Resource deleted"}


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
