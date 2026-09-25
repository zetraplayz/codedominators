import jwt
from fastapi import HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app import models

bearer_scheme = HTTPBearer(auto_error=False)

async def get_token(
    request: Request,
    bearer: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> str:
    cookie = request.cookies.get("cp_session")
    if cookie:
        return cookie
    if bearer:
        return bearer.credentials
    if settings.ENVIRONMENT == "development":
        return "DEV_TOKEN"
    raise HTTPException(401, "Not authenticated")

def verify_access_token(token: str) -> dict:
    if token == "DEV_TOKEN" and settings.ENVIRONMENT == "development":
        return {"sub": "sample_faculty_id", "exp": 9999999999}
    try:
        # Supabase uses HS256 by default. audience is "authenticated" for logged-in users.
        return jwt.decode(token, settings.SUPABASE_JWT_SECRET,
                          algorithms=["HS256"],
                          audience="authenticated",
                          options={"require": ["exp", "sub"]})
    except jwt.PyJWTError:
        raise HTTPException(401, "Invalid session")

def get_current_profile(token: str = Depends(get_token), db: Session = Depends(get_db)) -> models.User:
    payload = verify_access_token(token)
    profile = db.query(models.User).filter(models.User.id == payload["sub"]).first()
    
    if not profile:
        # P0.2 & Bootstrap: In a real system, the user should be created on signup via triggers.
        # If they don't exist yet, we might reject them, but for this app we could lazily create them 
        # or just raise an error.
        raise HTTPException(401, "Account unavailable")
        
    return profile
