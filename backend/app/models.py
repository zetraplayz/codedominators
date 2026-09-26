from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Department(Base):
    __tablename__ = "departments"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    hod_id = Column(String, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    users = relationship("User", back_populates="department", foreign_keys="[User.department_id]")

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    employee_id = Column(String, unique=True, index=True, nullable=False)
    official_email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=True) # Added for local auth
    
    role = Column(String, default="STAFF", nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    
    designation = Column(String)
    job_profile = Column(String)
    specialization = Column(String)
    assigned_courses = Column(String)
    mobile_number = Column(String)
    profile_photo = Column(String)
    short_bio = Column(Text)
    education = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    department = relationship("Department", back_populates="users", foreign_keys=[department_id])
    resources = relationship("Resource", back_populates="owner")


class Resource(Base):
    __tablename__ = "resources"
    
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    visibility = Column(String, default="PRIVATE", nullable=False)
    forked_from_id = Column(Integer, ForeignKey("resources.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    owner = relationship("User", back_populates="resources")
    versions = relationship("ResourceVersion", back_populates="resource", cascade="all, delete-orphan")
    permissions = relationship("ResourcePermission", back_populates="resource", cascade="all, delete-orphan")
    forked_from = relationship("Resource", remote_side=[id])

class ResourceVersion(Base):
    __tablename__ = "resource_versions"
    
    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=False)
    version_number = Column(Integer, nullable=False)
    parent_version_id = Column(Integer, ForeignKey("resource_versions.id"), nullable=True)
    storage_path = Column(String, nullable=False)
    checksum = Column(String)
    file_size = Column(Integer)
    mime_type = Column(String)
    created_by = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    change_note = Column(Text)
    status = Column(String, default="PUBLISHED", nullable=False)
    
    # Relationships
    resource = relationship("Resource", back_populates="versions")
    creator = relationship("User")

class ResourcePermission(Base):
    __tablename__ = "resource_permissions"
    
    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    permission_level = Column(String, nullable=False)
    granted_by = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    resource = relationship("Resource", back_populates="permissions")
    user = relationship("User", foreign_keys=[user_id])
    grantor = relationship("User", foreign_keys=[granted_by])

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    type = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    metadata_obj = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class UserBlock(Base):
    __tablename__ = "user_blocks"

    id = Column(Integer, primary_key=True, index=True)
    blocker_id = Column(String, ForeignKey("users.id"), nullable=False)
    blocked_id = Column(String, ForeignKey("users.id"), nullable=False)
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ResourceReview(Base):
    __tablename__ = "resource_reviews"

    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=False)
    reviewer_id = Column(String, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)
    feedback = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class TeachingKit(Base):
    __tablename__ = "teaching_kits"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    visibility = Column(String, default="PRIVATE", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class TeachingKitResource(Base):
    __tablename__ = "teaching_kit_resources"

    id = Column(Integer, primary_key=True, index=True)
    kit_id = Column(Integer, ForeignKey("teaching_kits.id"), nullable=False)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=False)
    added_at = Column(DateTime(timezone=True), server_default=func.now())

