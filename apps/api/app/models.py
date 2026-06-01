from datetime import datetime, timezone
from enum import Enum
from uuid import UUID, uuid4

from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, SQLModel


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class GenerationMode(str, Enum):
    free = "free"
    premium = "premium"
    premium_plus = "premium_plus"


class AgeLevel(str, Enum):
    preschool = "3-5"
    junior = "6-8"
    senior = "9+"


class GenerationStatus(str, Enum):
    queued = "queued"
    processing = "processing"
    completed = "completed"
    failed = "failed"


class User(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    telegram_id: str | None = Field(default=None, index=True)
    email: str | None = Field(default=None, index=True)
    plan_code: str = Field(default="free", index=True)
    created_at: datetime = Field(default_factory=utcnow)


class Plan(SQLModel, table=True):
    code: str = Field(primary_key=True)
    name: str
    monthly_price_cents: int = 0
    daily_limit: int | None = None
    is_active: bool = True


class PromptTemplate(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    mode: GenerationMode = Field(index=True)
    age_level: AgeLevel = Field(index=True)
    story: str | None = Field(default=None, index=True)
    model_name: str
    prompt: str
    is_active: bool = True
    updated_at: datetime = Field(default_factory=utcnow)


class Generation(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID | None = Field(default=None, foreign_key="user.id", index=True)
    mode: GenerationMode = Field(index=True)
    age_level: AgeLevel
    story: str | None = None
    status: GenerationStatus = Field(default=GenerationStatus.queued, index=True)
    source_key: str
    png_key: str | None = None
    pdf_key: str | None = None
    error_message: str | None = None
    generation_metadata: dict = Field(default_factory=dict, sa_column=Column("metadata", JSONB))
    created_at: datetime = Field(default_factory=utcnow, index=True)
    updated_at: datetime = Field(default_factory=utcnow)


class ErrorLog(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    generation_id: UUID | None = Field(default=None, foreign_key="generation.id")
    message: str
    context: dict = Field(default_factory=dict, sa_column=Column(JSONB))
    created_at: datetime = Field(default_factory=utcnow)
