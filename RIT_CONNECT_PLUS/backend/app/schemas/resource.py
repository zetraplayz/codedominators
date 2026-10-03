from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ResourceVersionBase(BaseModel):
    version_number: int
    storage_path: str
    checksum: Optional[str] = None
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    change_note: Optional[str] = None
    status: str = "PUBLISHED"

class ResourceVersionCreate(ResourceVersionBase):
    pass

class ResourceVersion(ResourceVersionBase):
    id: int
    resource_id: int
    parent_version_id: Optional[int] = None
    created_by: str
    created_at: datetime

    class Config:
        from_attributes = True

class ResourceBase(BaseModel):
    title: str
    description: Optional[str] = None
    visibility: str = "PRIVATE"

class ResourceCreate(ResourceBase):
    pass

class Resource(ResourceBase):
    id: int
    owner_id: str
    created_at: datetime
    versions: List[ResourceVersion] = []

    class Config:
        from_attributes = True
