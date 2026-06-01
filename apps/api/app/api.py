from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, Header, HTTPException, UploadFile
from sqlmodel import Session, func, select

from app.config import Settings, get_settings
from app.db import get_session
from app.image_processing import normalize_uploaded_image
from app.models import AgeLevel, Generation, GenerationMode, GenerationStatus, User
from app.schemas import GenerationCreateResponse, GenerationRead, StatsRead
from app.storage import Storage, make_object_key
from app.tasks import generate_coloring_page

router = APIRouter()


def require_admin(
    authorization: Annotated[str | None, Header()] = None,
    settings: Settings = Depends(get_settings),
) -> None:
    expected = f"Bearer {settings.admin_api_token}"
    if authorization != expected:
        raise HTTPException(status_code=401, detail="Invalid admin token")


@router.post("/generations", response_model=GenerationCreateResponse)
async def create_generation(
    image: UploadFile = File(...),
    mode: GenerationMode = Form(...),
    age_level: AgeLevel = Form(...),
    story: str | None = Form(default=None),
    session: Session = Depends(get_session),
    settings: Settings = Depends(get_settings),
) -> GenerationCreateResponse:
    if image.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(status_code=415, detail="Only JPEG, PNG and WEBP are supported")

    data = await image.read()
    if len(data) > settings.max_upload_bytes:
        raise HTTPException(status_code=413, detail="Image is larger than 20 MB")

    if mode != GenerationMode.premium_plus:
        story = None
    elif not story:
        raise HTTPException(status_code=422, detail="Story is required for Premium+")

    normalized = normalize_uploaded_image(data)
    storage = Storage()
    source_key = make_object_key("uploads", "png")
    storage.put_bytes(source_key, normalized, "image/png")

    generation = Generation(mode=mode, age_level=age_level, story=story, source_key=source_key)
    session.add(generation)
    session.commit()
    session.refresh(generation)

    generate_coloring_page.delay(str(generation.id))
    return GenerationCreateResponse(id=generation.id, status=generation.status)


@router.get("/generations/{generation_id}", response_model=GenerationRead)
def read_generation(generation_id: UUID, session: Session = Depends(get_session)) -> GenerationRead:
    generation = session.get(Generation, generation_id)
    if not generation:
        raise HTTPException(status_code=404, detail="Generation not found")

    storage = Storage()
    return GenerationRead(
        id=generation.id,
        mode=generation.mode,
        age_level=generation.age_level,
        story=generation.story,
        status=generation.status,
        png_url=storage.public_url(generation.png_key),
        pdf_url=storage.public_url(generation.pdf_key),
        error_message=generation.error_message,
    )


@router.get("/admin/stats", response_model=StatsRead, dependencies=[Depends(require_admin)])
def admin_stats(session: Session = Depends(get_session)) -> StatsRead:
    users = session.exec(select(func.count(User.id))).one()
    generations = session.exec(select(func.count(Generation.id))).one()
    completed = session.exec(
        select(func.count(Generation.id)).where(Generation.status == GenerationStatus.completed)
    ).one()
    failed = session.exec(select(func.count(Generation.id)).where(Generation.status == GenerationStatus.failed)).one()
    return StatsRead(
        users=users,
        generations=generations,
        completed_generations=completed,
        failed_generations=failed,
        conversion_rate=0.0,
        sales=0,
    )
