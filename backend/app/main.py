import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import resources, ai, auth, kits, departments, admin, calls, conversations
from app.core.database import engine, Base

# Create tables locally in SQLite
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Connect Plus API",
    description="Backend API for Connect Plus - Institutional Faculty Resource Platform",
    version="1.0.0"
)

# CORS configuration for Next.js frontend
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://codedominators-five.vercel.app",
    "https://codedominators-fxnjqm3do-zetra.vercel.app",
    "https://codedominators-xkdg.vercel.app",
]

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Connect Plus API is running. Go to /docs for Swagger UI"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Basic Rate Limiting Middleware (in-memory, per-IP)
from fastapi import Request
from fastapi.responses import JSONResponse
import time

request_counts = {}
RATE_LIMIT_DURATION = 60 # seconds
RATE_LIMIT_REQUESTS = 100 # max requests per IP per minute

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host if request.client else "unknown"
    current_time = time.time()
    
    if client_ip not in request_counts:
        request_counts[client_ip] = {"count": 1, "start_time": current_time}
    else:
        # Reset if duration passed
        if current_time - request_counts[client_ip]["start_time"] > RATE_LIMIT_DURATION:
            request_counts[client_ip] = {"count": 1, "start_time": current_time}
        else:
            request_counts[client_ip]["count"] += 1
            if request_counts[client_ip]["count"] > RATE_LIMIT_REQUESTS:
                return JSONResponse(status_code=429, content={"detail": "Rate limit exceeded. Please try again later."})
                
    response = await call_next(request)
    return response

from app.core.database import SessionLocal
from app.models import SystemSettings
from starlette.concurrency import run_in_threadpool

@app.middleware("http")
async def maintenance_mode_middleware(request: Request, call_next):
    # Exclude admin routes (they need access to disable maintenance), auth (login), and docs
    path = request.url.path
    if path.startswith("/api/admin") or path.startswith("/api/auth") or path.startswith("/api/public") or path.startswith("/docs") or path.startswith("/openapi.json"):
        return await call_next(request)
        
    def check_system_state():
        db = SessionLocal()
        try:
            maintenance = db.query(SystemSettings).filter(SystemSettings.key == "MAINTENANCE_MODE").first()
            dev_mode = db.query(SystemSettings).filter(SystemSettings.key == "DEVELOPER_MODE").first()
            
            is_maint = maintenance and maintenance.value == "true"
            is_dev = dev_mode and dev_mode.value == "true"
            return is_maint, is_dev
        finally:
            db.close()

    is_maintenance, is_dev_mode = await run_in_threadpool(check_system_state)
    if is_maintenance or is_dev_mode:
        mode_name = "maintenance" if is_maintenance else "developer mode"
        return JSONResponse(status_code=503, content={"detail": f"System is currently in {mode_name}."})
        
    return await call_next(request)

# Audit Logging Middleware for critical actions
import logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("audit")

@app.middleware("http")
async def audit_log_middleware(request: Request, call_next):
    method = request.method
    path = request.url.path
    if method in ["POST", "PUT", "DELETE"] and not path.startswith("/api/calls/ws"):
        client_ip = request.client.host if request.client else "unknown"
        # We log the attempt, we don't have the user ID easily available here without decoding JWT
        logger.info(f"AUDIT: [{method}] {path} from IP: {client_ip}")
        
    response = await call_next(request)
    return response

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(resources.router, prefix="/api/resources", tags=["Resources"])
app.include_router(kits.router, prefix="/api/kits", tags=["Kits"])
app.include_router(departments.router, prefix="/api/departments", tags=["Departments"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])
app.include_router(calls.router, prefix="/api/calls", tags=["Calls"])
app.include_router(conversations.router, prefix="/api/conversations", tags=["Conversations"])

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Connect Plus API is running successfully"}

@app.get("/api/public/settings")
def get_public_settings():
    db = SessionLocal()
    try:
        settings = db.query(SystemSettings).filter(
            SystemSettings.key.in_([
                "MAINTENANCE_MODE", "DEVELOPER_MODE", "DEV_MODE_ANNOUNCEMENT",
                "MODE_VERSION", "PATCH_NOTE_VERSION", "PATCH_NOTE_CONTENT"
            ])
        ).all()
        return {s.key: s.value for s in settings}
    finally:
        db.close()
