from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import resources, ai

app = FastAPI(
    title="Connect Plus API",
    description="Backend API for Connect Plus - Institutional Faculty Resource Platform",
    version="1.0.0"
)

# CORS configuration for Next.js frontend
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resources.router, prefix="/api/resources", tags=["Resources"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Connect Plus API is running successfully"}
