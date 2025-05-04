import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Photo Gallery API"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.environ.get("SECRET_KEY", "supersecretkey")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database settings
    USE_SQLITE: bool = os.environ.get("USE_SQLITE", "True").lower() == "true"
    SQLITE_DB_FILE: str = os.environ.get("SQLITE_DB_FILE", "photo_gallery.db")
    
    # PostgreSQL settings (used if USE_SQLITE is False)
    POSTGRES_USER: str = os.environ.get("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.environ.get("POSTGRES_PASSWORD", "postgres")
    POSTGRES_SERVER: str = os.environ.get("POSTGRES_SERVER", "localhost")
    POSTGRES_PORT: str = os.environ.get("POSTGRES_PORT", "5432")
    POSTGRES_DB: str = os.environ.get("POSTGRES_DB", "photo_gallery")
    DATABASE_URL: Optional[str] = None

    # UPLOAD_DIRECTORY: str = os.environ.get("UPLOAD_DIRECTORY", "uploads")
    UPLOAD_DIRECTORY: str = "/Users/hisoakende/kursach1/photo_gallery/backend/uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10 MB

    class Config:
        env_file = ".env"
        case_sensitive = True

    def __init__(self, **data):
        super().__init__(**data)
        
        # Set up database URL based on configuration
        if self.USE_SQLITE:
            self.DATABASE_URL = f"sqlite:///./{self.SQLITE_DB_FILE}"
        else:
            self.DATABASE_URL = f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        
        # Create uploads directory if it doesn't exist
        os.makedirs(self.UPLOAD_DIRECTORY, exist_ok=True)


settings = Settings()