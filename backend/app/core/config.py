from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
    )

    supabase_url: str
    supabase_service_role_key: str
    gemini_api_key: str
    ai_vision_provider: str = "gemini"


@lru_cache
def get_settings() -> Settings:
    return Settings()

model_config = SettingsConfigDict(
    extra="ignore",
)