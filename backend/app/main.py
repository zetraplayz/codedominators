import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import resources, ai, auth, kits, departments, admin
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

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(resources.router, prefix="/api/resources", tags=["Resources"])
app.include_router(kits.router, prefix="/api/kits", tags=["Kits"])
app.include_router(departments.router, prefix="/api/departments", tags=["Departments"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Connect Plus API is running successfully"}
