import jwt
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app import models

bearer_scheme = HTTPBearer(auto_error=False)

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode.update({"exp": expire})
    # audience="authenticated" for compatibility with frontend expectations
    to_encode.update({"aud": "authenticated"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt

async def get_token(
    request: Request,
    bearer: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> str:
    cookie = request.cookies.get("cp_session")
    if cookie:
        return cookie
    if bearer:
        return bearer.credentials
    raise HTTPException(401, "Not authenticated")

def verify_access_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.SECRET_KEY,
                          algorithms=["HS256"],
                          audience="authenticated",
                          options={"require": ["exp", "sub"]})
    except jwt.PyJWTError:
        raise HTTPException(401, "Invalid session")

def get_current_profile(token: str = Depends(get_token), db: Session = Depends(get_db)) -> models.User:
    payload = verify_access_token(token)
    profile = db.query(models.User).filter(models.User.id == payload["sub"]).first()
    
    if not profile:
        raise HTTPException(401, "Account unavailable")
        
    return profile
