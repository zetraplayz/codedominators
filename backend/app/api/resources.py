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


MAX_SIZE = 50 * 1024 * 1024
ALLOWED_EXTENSIONS = {".pdf", ".txt", ".pptx", ".docx"}

async def read_bounded(file: UploadFile, max_bytes: int) -> bytes:
    chunks = []
    total = 0
    while True:
        chunk = await file.read(1024 * 1024)
        if not chunk:
            break
        total += len(chunk)
        if total > max_bytes:
            raise HTTPException(413, "File too large")
        chunks.append(chunk)
    return b"".join(chunks)

from app.core.auth import get_current_profile

@router.post("/", response_model=resource_schema.Resource)
async def create_resource(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    visibility: str = Form("PRIVATE"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    profile: models.User = Depends(get_current_profile)
):
    import uuid
    import mimetypes

    # 1. Bounded read
    file_bytes = await read_bounded(file, MAX_SIZE)
    file_size = len(file_bytes)
    
    # Check extension
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(415, f"Unsupported file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")

    checksum = hashlib.sha256(file_bytes).hexdigest()
    
    # 2. Storage First (P0.7 UUID key & P0.13 Storage-first)
    storage_key = f"resources/{uuid.uuid4()}{ext}"
    storage_path = None
    
    if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY:
        try:
            supabase = get_supabase()
            supabase.storage.from_(STORAGE_BUCKET).upload(
                path=storage_key,
                file=file_bytes,
                file_options={"content-type": file.content_type or mimetypes.guess_type(file.filename)[0] or "application/octet-stream"}
            )
            storage_path = storage_key
        except Exception as e:
            print(f"[WARN] Supabase Storage upload failed: {e}. Falling back to local.")
            
    if not storage_path:
        local_path = os.path.join(UPLOAD_DIR, storage_key.replace("/", "_"))
        with open(local_path, "wb") as f:
            f.write(file_bytes)
        storage_path = local_path

    # Ensure user exists in local DB (Temporary for dev)
    user = db.query(models.User).filter(models.User.id == profile.id).first()
    if not user:
        user = models.User(
            id=profile.id,
            full_name="Faculty Member",
            employee_id=profile.id,
            official_email=f"{profile.id}@institution.edu"
        )
        db.add(user)
        db.commit()

    # 3. THEN the DB transaction
    db_resource = models.Resource(
        title=title,
        description=description,
        visibility=visibility,
        owner_id=profile.id
    )
    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)

    db_version = models.ResourceVersion(
        resource_id=db_resource.id,
        version_number=1,
        storage_path=storage_path,
        file_size=file_size,
        mime_type=file.content_type,
        checksum=checksum,
        status="PUBLISHED",
        created_by=profile.id
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


from fastapi.responses import FileResponse, StreamingResponse
import io

@router.get("/{resource_id}", response_model=resource_schema.Resource)
def get_resource(resource_id: int, db: Session = Depends(get_db)):
    resource = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    return resource

@router.get("/{resource_id}/download")
def download_resource(resource_id: int, db: Session = Depends(get_db)):
    resource = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    latest_version = None
    if resource.versions:
        latest_version = sorted(resource.versions, key=lambda v: v.version_number, reverse=True)[0]
        
    if not latest_version or not latest_version.storage_path:
        raise HTTPException(status_code=404, detail="File not found")
        
    path = latest_version.storage_path
    
    # Local fallback path check
    if os.path.exists(path):
        original_filename = path.split("_", 1)[-1] if "_" in os.path.basename(path) else os.path.basename(path)
        return FileResponse(path, filename=original_filename, media_type=latest_version.mime_type or "application/octet-stream")
        
    # Supabase fetch
    try:
        supabase = get_supabase()
        res = supabase.storage.from_(STORAGE_BUCKET).download(path)
        return StreamingResponse(io.BytesIO(res), media_type=latest_version.mime_type or "application/octet-stream", headers={
            "Content-Disposition": f'attachment; filename="{os.path.basename(path)}"'
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to download from storage: {e}")


@router.delete("/{resource_id}")
def delete_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    profile: models.User = Depends(get_current_profile)
):
    resource = db.query(models.Resource).filter(
        models.Resource.id == resource_id,
        models.Resource.owner_id == profile.id
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
    db: Session = Depends(get_db),
    profile: models.User = Depends(get_current_profile)
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
        created_by=profile.id
    )
    db.add(db_version)
    db.commit()
    db.refresh(db_version)
    return db_version
