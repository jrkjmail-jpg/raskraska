from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "local"
    database_url: str = "postgresql+psycopg://coloring:coloring@localhost:5432/coloring"
    redis_url: str = "redis://localhost:6379/0"
    openai_api_key: str = ""
    s3_endpoint_url: str = "http://localhost:9000"
    s3_access_key_id: str = "minioadmin"
    s3_secret_access_key: str = "minioadmin"
    s3_bucket: str = "coloring-book"
    s3_public_base_url: str = "http://localhost:9000/coloring-book"
    admin_api_token: str = Field(default="change-me")
    telegram_bot_token: str = ""
    max_upload_bytes: int = 20 * 1024 * 1024

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


@lru_cache
def get_settings() -> Settings:
    return Settings()
