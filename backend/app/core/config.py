import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Connect Plus API"
    API_V1_STR: str = "/api/v1"
    
    # Supabase / Database
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./connect_plus.db")
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "MESH_super_secret_key_2026")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
