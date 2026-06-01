from celery import Celery

from app.config import get_settings

settings = get_settings()

celery_app = Celery(
    "coloring_book",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["app.tasks"],
)
