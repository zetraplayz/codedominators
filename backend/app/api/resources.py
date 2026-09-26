import os
import hashlib
import shutil
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app import models
from app.schemas import resource as resource_schema

router = APIRouter()

class AccessRequestRespond(BaseModel):
    action: str

class ReviewCreate(BaseModel):
    rating: int
    feedback: Optional[str]

# Local uploads directory
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
if os.getenv("VERCEL") == "1":
    UPLOAD_DIR = "/tmp/uploads"

try:
    os.makedirs(UPLOAD_DIR, exist_ok=True)
except OSError:
    pass


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

@router.post("")
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
    
    # 2. Local Storage
    storage_key = f"resources/{uuid.uuid4()}{ext}"
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
    try:
        db_resource = models.Resource(
            title=title,
            description=description,
            visibility=visibility,
            owner_id=profile.id
        )
        db.add(db_resource)
        db.flush() # Flush to get db_resource.id without committing

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
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database transaction failed: {str(e)}")


from sqlalchemy.orm import selectinload

@router.get("")
@router.get("/", response_model=List[resource_schema.Resource])
def list_resources(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    profile: models.User = Depends(get_current_profile)
):
    from sqlalchemy import or_, and_
    
    resources = (
        db.query(models.Resource)
        .join(models.User, models.Resource.owner_id == models.User.id)
        .options(selectinload(models.Resource.versions))
        .filter(
            or_(
                models.Resource.owner_id == profile.id,
                models.Resource.visibility == "INSTITUTION_DISCOVERABLE",
                and_(
                    models.Resource.visibility == "DEPARTMENT_DISCOVERABLE",
                    models.User.department_id == profile.department_id
                )
            )
        )
        .offset(skip)
        .limit(limit)
        .all()
    )
    return resources


from fastapi.responses import FileResponse, StreamingResponse
import io


@router.get("/{resource_id}/download")
def download_resource(
    resource_id: int, 
    db: Session = Depends(get_db),
    profile: models.User = Depends(get_current_profile)
):
    resource = db.query(models.Resource).options(selectinload(models.Resource.versions)).filter(models.Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    owner = db.query(models.User).filter(models.User.id == resource.owner_id).first()
    if resource.owner_id != profile.id:
        if resource.visibility == "PRIVATE":
            raise HTTPException(status_code=403, detail="Forbidden")
        elif resource.visibility == "DEPARTMENT_DISCOVERABLE":
            if owner and owner.department_id != profile.department_id:
                raise HTTPException(status_code=403, detail="Forbidden: Not in the same department")
    
    latest_version = None
    if resource.versions:
        latest_version = sorted(resource.versions, key=lambda v: v.version_number, reverse=True)[0]  # type: ignore
        
    if not latest_version or not latest_version.storage_path:
        raise HTTPException(status_code=404, detail="File not found")
        
    path = latest_version.storage_path
    
    # Local fallback path check
    if os.path.exists(path):
        original_filename = path.split("_", 1)[-1] if "_" in os.path.basename(path) else os.path.basename(path)
        return FileResponse(path, filename=original_filename, media_type=latest_version.mime_type or "application/octet-stream")
        
    raise HTTPException(status_code=404, detail="File not found on server")


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
    # Clean up foreign key references without cascade rules
    db.query(models.TeachingKitResource).filter(models.TeachingKitResource.resource_id == resource_id).delete()
    db.query(models.ResourceReview).filter(models.ResourceReview.resource_id == resource_id).delete()
    
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
        
    if resource.owner_id != profile.id:
        raise HTTPException(status_code=403, detail="Forbidden. Only the owner can create a new version.")

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


@router.post("/{resource_id}/request-access")
def request_access(
    resource_id: int,
    db: Session = Depends(get_db),
    profile: models.User = Depends(get_current_profile)
):
    resource = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    if resource.owner_id == profile.id:
        raise HTTPException(status_code=400, detail="You already own this resource")

    # Check if blocked
    is_blocked = db.query(models.UserBlock).filter(
        models.UserBlock.blocker_id == resource.owner_id,
        models.UserBlock.blocked_id == profile.id
    ).first()
    
    if is_blocked:
        raise HTTPException(status_code=403, detail="You are not permitted to request access from this user.")

    # Create notification
    notif = models.Notification(
        user_id=resource.owner_id,
        type="RESOURCE_ACCESS_REQUEST",
        message=f"{profile.full_name} has requested edit access to your resource '{resource.title}'.",
        metadata_obj={"requester_id": profile.id, "resource_id": resource.id}
    )
    db.add(notif)
    db.commit()
    
    return {"detail": "Access request sent successfully."}


@router.post("/{resource_id}/approve-access/{notification_id}")
def approve_access(
    resource_id: int,
    notification_id: int,
    db: Session = Depends(get_db),
    profile: models.User = Depends(get_current_profile)
):
    # 1. Verify owner
    resource = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not resource or resource.owner_id != profile.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # 2. Verify notification
    notif = db.query(models.Notification).filter(
        models.Notification.id == notification_id,
        models.Notification.user_id == profile.id
    ).first()
    
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    requester_id = notif.metadata_obj.get("requester_id")
    if not requester_id:
        raise HTTPException(status_code=400, detail="Invalid notification metadata")

    # 3. Mark read
    notif.is_read = True  # type: ignore

    # 4. Fork the resource for the requester
    new_resource = models.Resource(
        title=resource.title,
        description=resource.description,
        visibility="PRIVATE",
        owner_id=requester_id,
        forked_from_id=resource.id
    )
    db.add(new_resource)
    db.flush()

    # 5. Copy the latest version
    latest_version = db.query(models.ResourceVersion).filter(
        models.ResourceVersion.resource_id == resource.id
    ).order_by(models.ResourceVersion.version_number.desc()).first()

    if latest_version:
        new_version = models.ResourceVersion(
            resource_id=new_resource.id,
            version_number=1,
            storage_path=latest_version.storage_path,
            checksum=latest_version.checksum,
            file_size=latest_version.file_size,
            mime_type=latest_version.mime_type,
            change_note="Forked from original",
            created_by=requester_id,
            status="PUBLISHED"
        )
        db.add(new_version)
    
    # 6. Notify requester
    approval_notif = models.Notification(
        user_id=requester_id,
        type="RESOURCE_ACCESS_GRANTED",
        message=f"{profile.full_name} has approved your access request. A copy of '{resource.title}' has been added to your resources.",
        metadata_obj={"resource_id": new_resource.id, "original_id": resource.id}
    )
    db.add(approval_notif)

    db.commit()
    return {"detail": "Request approved. Resource forked for the requester."}


@router.post("/{resource_id}/reviews")
def add_review(resource_id: int, review: ReviewCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_profile)):
    resource = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
        
    owner = db.query(models.User).filter(models.User.id == resource.owner_id).first()
    if resource.owner_id != current_user.id:
        if resource.visibility == "PRIVATE":
            raise HTTPException(status_code=403, detail="Forbidden. You do not have permission to review this resource.")
        elif resource.visibility == "DEPARTMENT_DISCOVERABLE":
            if owner and owner.department_id != current_user.department_id:
                raise HTTPException(status_code=403, detail="Forbidden: Not in the same department")
        
    new_review = models.ResourceReview(
        resource_id=resource_id,
        reviewer_id=current_user.id,
        rating=review.rating,
        feedback=review.feedback
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    
    return {"status": "ok", "id": new_review.id}

@router.get("/{resource_id}/reviews")
def get_reviews(resource_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_profile)):
    resource = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
        
    owner = db.query(models.User).filter(models.User.id == resource.owner_id).first()
    if resource.owner_id != current_user.id:
        if resource.visibility == "PRIVATE":
            raise HTTPException(status_code=403, detail="Forbidden. You do not have permission to view reviews for this resource.")
        elif resource.visibility == "DEPARTMENT_DISCOVERABLE":
            if owner and owner.department_id != current_user.department_id:
                raise HTTPException(status_code=403, detail="Forbidden: Not in the same department")

    reviews = db.query(models.ResourceReview).filter(models.ResourceReview.resource_id == resource_id).order_by(models.ResourceReview.created_at.desc()).all()
    
    result = []
    for r in reviews:
        reviewer = db.query(models.User).filter(models.User.id == r.reviewer_id).first()
        result.append({
            "id": r.id,
            "rating": r.rating,
            "feedback": r.feedback,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "reviewer_name": reviewer.full_name if reviewer else "Unknown",
            "reviewer_photo": reviewer.profile_photo if reviewer else None
        })
    return result

@router.get("/{resource_id}")
def get_resource_details(resource_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_profile)):
    resource = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    owner = db.query(models.User).filter(models.User.id == resource.owner_id).first()
    
    if resource.owner_id != current_user.id:
        if resource.visibility == "PRIVATE":
            raise HTTPException(status_code=403, detail="Forbidden: Resource is private")
        elif resource.visibility == "DEPARTMENT_DISCOVERABLE":
            if owner and owner.department_id != current_user.department_id:
                raise HTTPException(status_code=403, detail="Forbidden: Not in the same department")
    
    # Calculate avg rating
    reviews = db.query(models.ResourceReview).filter(models.ResourceReview.resource_id == resource_id).all()
    avg_rating = sum(r.rating for r in reviews) / len(reviews) if reviews else 0
    
    return {
        "id": resource.id,
        "title": resource.title,
        "description": resource.description,
        "visibility": resource.visibility,
        "created_at": resource.created_at.isoformat() if resource.created_at else None,
        "owner_id": resource.owner_id,
        "owner_name": owner.full_name if owner else "Unknown",
        "owner_photo": owner.profile_photo if owner else None,
        "rating": round(avg_rating, 1),
        "review_count": len(reviews)
    }

@router.get("/{resource_id}/recommendations")
def get_recommendations(resource_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_profile)):
    # Simple recommendation: fetch resources with the same owner, or containing similar words in title
    target = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not target:
        return []
        
    if target.owner_id != current_user.id and target.visibility == "PRIVATE":
        raise HTTPException(status_code=403, detail="Forbidden. You do not have permission to view recommendations for this resource.")

    words = [w.lower() for w in target.title.split() if len(w) > 3]
    
    from sqlalchemy import or_, and_
    query = db.query(models.Resource).join(models.User).filter(
        models.Resource.id != resource_id,
        or_(
            models.Resource.visibility == "INSTITUTION_DISCOVERABLE",
            and_(
                models.Resource.visibility == "DEPARTMENT_DISCOVERABLE",
                models.User.department_id == current_user.department_id
            )
        )
    )
    
    # We will score them in Python for simplicity
    all_public = query.all()
    scored = []
    for r in all_public:
        score = 0
        r_words = [w.lower() for w in r.title.split()]
        for w in words:
            if w in r_words:
                score += 1
        if r.owner_id == target.owner_id:
            score += 0.5
        if score > 0:
            scored.append((score, r))
            
    scored.sort(key=lambda x: x[0], reverse=True)
    recommended = [x[1] for x in scored[:3]] # Top 3
    
    result = []
    for r in recommended:
        result.append({
            "id": r.id,
            "title": r.title,
            "description": r.description,
            "visibility": r.visibility,
            "created_at": r.created_at.isoformat() if r.created_at else None
        })
    return result

