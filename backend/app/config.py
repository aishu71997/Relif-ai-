# config.py - Environment & Application Configuration
# Loads and validates all environmental keys.

import os
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """
    ReliefAI Application Configuration.
    Supports local fallback variables for seamless developer and offline testing.
    """
    APP_NAME: str = "ReliefAI Backend"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Security Configurations
    JWT_SECRET: str = os.environ.get("JWT_SECRET", "super-secret-crisis-key-1337-relief-ai")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # 24 Hours default
    
    # Supabase Settings
    SUPABASE_URL: Optional[str] = os.environ.get("SUPABASE_URL")
    SUPABASE_KEY: Optional[str] = os.environ.get("SUPABASE_KEY")

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
