from uuid import UUID

from pydantic import BaseModel, HttpUrl

from app.models import AgeLevel, GenerationMode, GenerationStatus


class GenerationCreateResponse(BaseModel):
    id: UUID
    status: GenerationStatus


class GenerationRead(BaseModel):
    id: UUID
    mode: GenerationMode
    age_level: AgeLevel
    story: str | None
    status: GenerationStatus
    png_url: str | None = None
    pdf_url: str | None = None
    error_message: str | None = None


class PresignedUpload(BaseModel):
    upload_url: HttpUrl
    object_key: str


class StatsRead(BaseModel):
    users: int
    generations: int
    completed_generations: int
    failed_generations: int
    conversion_rate: float
    sales: int
