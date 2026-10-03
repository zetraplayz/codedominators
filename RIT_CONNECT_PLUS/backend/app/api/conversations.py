"""
Conversations API — RIT Connect Plus
Real-time institutional messaging between ADMIN, HOD, and STAFF.
"""
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
from pydantic import BaseModel

from app.core.database import get_db
from app import models
from app.core.auth import get_current_profile

router = APIRouter()


# ─────────────────────────────────────────────────────────
# SCHEMAS
# ─────────────────────────────────────────────────────────

class ConversationCreate(BaseModel):
    participant_id: str          # The other user's ID
    initial_message: str


class MessageCreate(BaseModel):
    content: str


class ConversationOut(BaseModel):
    id: str
    other_user_id: str
    other_user_name: str
    other_user_photo: Optional[str]
    other_user_role: str
    last_message: Optional[str]
    last_message_at: Optional[str]
    unread_count: int


# ─────────────────────────────────────────────────────────
# CONVERSATION ENDPOINTS
# ─────────────────────────────────────────────────────────

@router.get("/", response_model=List[ConversationOut])
def list_conversations(
    profile: models.User = Depends(get_current_profile),
    db: Session = Depends(get_db)
):
    """List all conversations for the current user."""
    convos = db.query(models.Conversation).filter(
        or_(
            models.Conversation.user_a_id == profile.id,
            models.Conversation.user_b_id == profile.id
        )
    ).order_by(models.Conversation.updated_at.desc()).all()

    result = []
    for c in convos:
        other_id = c.user_b_id if c.user_a_id == profile.id else c.user_a_id
        other = db.query(models.User).filter(models.User.id == other_id).first()
        if not other:
            continue

        # Get last message
        last_msg = db.query(models.ConversationMessage).filter(
            models.ConversationMessage.conversation_id == c.id
        ).order_by(models.ConversationMessage.created_at.desc()).first()

        # Count unread
        unread = db.query(models.ConversationMessage).filter(
            models.ConversationMessage.conversation_id == c.id,
            models.ConversationMessage.sender_id != profile.id,
            models.ConversationMessage.is_read == False
        ).count()

        result.append(ConversationOut(
            id=c.id,
            other_user_id=other.id,
            other_user_name=other.full_name,
            other_user_photo=other.profile_photo,
            other_user_role=other.role,
            last_message=last_msg.content if last_msg else None,
            last_message_at=last_msg.created_at.isoformat() if last_msg and last_msg.created_at else None,
            unread_count=unread
        ))

    return result


@router.post("/")
def create_or_get_conversation(
    body: ConversationCreate,
    profile: models.User = Depends(get_current_profile),
    db: Session = Depends(get_db)
):
    """Create a conversation (or retrieve existing one) and send the first message."""
    if body.participant_id == profile.id:
        raise HTTPException(400, "Cannot start a conversation with yourself.")

    query = db.query(models.User).filter(models.User.id == body.participant_id)
    if profile.role != "ADMIN":
        query = query.filter(
            or_(
                models.User.department_id == profile.department_id,
                models.User.role == "ADMIN"
            )
        )
    other = query.first()
    if not other:
        raise HTTPException(404, "User not found or access denied.")

    # Check if blocked
    is_blocked = db.query(models.UserBlock).filter(
        or_(
            and_(models.UserBlock.blocker_id == profile.id, models.UserBlock.blocked_id == body.participant_id),
            and_(models.UserBlock.blocker_id == body.participant_id, models.UserBlock.blocked_id == profile.id)
        )
    ).first()
    if is_blocked:
        raise HTTPException(403, "Conversation not permitted.")

    # Find existing conversation
    existing = db.query(models.Conversation).filter(
        or_(
            and_(models.Conversation.user_a_id == profile.id, models.Conversation.user_b_id == body.participant_id),
            and_(models.Conversation.user_a_id == body.participant_id, models.Conversation.user_b_id == profile.id)
        )
    ).first()

    if not existing:
        existing = models.Conversation(
            id=str(uuid.uuid4()),
            user_a_id=profile.id,
            user_b_id=body.participant_id
        )
        db.add(existing)
        db.flush()

    # Add the initial message
    if body.initial_message.strip():
        msg = models.ConversationMessage(
            id=str(uuid.uuid4()),
            conversation_id=existing.id,
            sender_id=profile.id,
            content=body.initial_message.strip()
        )
        db.add(msg)

    db.commit()
    return {"conversation_id": existing.id}


@router.get("/{conversation_id}/messages")
def get_messages(
    conversation_id: str,
    profile: models.User = Depends(get_current_profile),
    db: Session = Depends(get_db)
):
    """Fetch all messages in a conversation (and mark incoming as read)."""
    convo = db.query(models.Conversation).filter(models.Conversation.id == conversation_id).first()
    if not convo:
        raise HTTPException(404, "Conversation not found.")

    if convo.user_a_id != profile.id and convo.user_b_id != profile.id:
        raise HTTPException(403, "Access denied.")

    # Mark incoming messages as read
    db.query(models.ConversationMessage).filter(
        models.ConversationMessage.conversation_id == conversation_id,
        models.ConversationMessage.sender_id != profile.id,
        models.ConversationMessage.is_read == False
    ).update({"is_read": True})
    db.commit()

    messages = db.query(models.ConversationMessage).filter(
        models.ConversationMessage.conversation_id == conversation_id
    ).order_by(models.ConversationMessage.created_at.asc()).all()

    result = []
    for m in messages:
        sender = db.query(models.User).filter(models.User.id == m.sender_id).first()
        result.append({
            "id": m.id,
            "sender_id": m.sender_id,
            "sender_name": sender.full_name if sender else "Unknown",
            "sender_photo": sender.profile_photo if sender else None,
            "is_mine": m.sender_id == profile.id,
            "content": m.content,
            "created_at": m.created_at.isoformat() if m.created_at else None,
            "is_read": m.is_read
        })
    return result


@router.post("/{conversation_id}/messages")
def send_message(
    conversation_id: str,
    body: MessageCreate,
    profile: models.User = Depends(get_current_profile),
    db: Session = Depends(get_db)
):
    """Send a message in a conversation."""
    convo = db.query(models.Conversation).filter(models.Conversation.id == conversation_id).first()
    if not convo:
        raise HTTPException(404, "Conversation not found.")

    if convo.user_a_id != profile.id and convo.user_b_id != profile.id:
        raise HTTPException(403, "Access denied.")

    other_user_id = convo.user_b_id if convo.user_a_id == profile.id else convo.user_a_id

    # Check if blocked
    is_blocked = db.query(models.UserBlock).filter(
        or_(
            and_(models.UserBlock.blocker_id == profile.id, models.UserBlock.blocked_id == other_user_id),
            and_(models.UserBlock.blocker_id == other_user_id, models.UserBlock.blocked_id == profile.id)
        )
    ).first()
    if is_blocked:
        raise HTTPException(403, "Conversation not permitted. User is blocked.")

    # Re-verify department scope (in case of department transfers)
    if profile.role != "ADMIN":
        other_user = db.query(models.User).filter(models.User.id == other_user_id).first()
        if other_user and other_user.role != "ADMIN" and other_user.department_id != profile.department_id:
            raise HTTPException(403, "Cannot send messages outside your department.")

    if not body.content.strip():
        raise HTTPException(400, "Message cannot be empty.")

    if len(body.content) > 4000:
        raise HTTPException(400, "Message too long (max 4000 characters).")

    msg = models.ConversationMessage(
        id=str(uuid.uuid4()),
        conversation_id=conversation_id,
        sender_id=profile.id,
        content=body.content.strip()
    )
    db.add(msg)
    # Update conversation timestamp
    convo.updated_at = func.now()  # type: ignore
    db.commit()
    db.refresh(msg)

    return {
        "id": msg.id,
        "content": msg.content,
        "created_at": msg.created_at.isoformat() if msg.created_at else None,
        "sender_id": msg.sender_id,
        "is_mine": True
    }


@router.get("/users/searchable")
def get_searchable_users(
    profile: models.User = Depends(get_current_profile),
    db: Session = Depends(get_db)
):
    """Get list of all users that the current user can message (excludes blocked)."""
    # Get blocked user IDs
    blocked_ids = {
        b.blocked_id for b in db.query(models.UserBlock).filter(
            models.UserBlock.blocker_id == profile.id
        ).all()
    }
    blocker_ids = {
        b.blocker_id for b in db.query(models.UserBlock).filter(
            models.UserBlock.blocked_id == profile.id
        ).all()
    }
    excluded = blocked_ids | blocker_ids | {profile.id}

    query = db.query(models.User).filter(~models.User.id.in_(excluded))

    if profile.role != "ADMIN":
        # HOD and STAFF can only see users in their own department, PLUS all ADMINs
        query = query.filter(
            or_(
                models.User.department_id == profile.department_id,
                models.User.role == "ADMIN"
            )
        )

    users = query.order_by(models.User.full_name).all()

    return [
        {
            "id": u.id,
            "name": u.full_name,
            "role": u.role,
            "department": u.department.name if u.department else None,
            "photo": u.profile_photo,
            "email": u.official_email
        }
        for u in users
    ]
