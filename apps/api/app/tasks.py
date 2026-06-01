from uuid import UUID

from sqlmodel import Session

from app.db import engine
from app.image_processing import create_a4_pdf
from app.models import ErrorLog, Generation, GenerationStatus, utcnow
from app.openai_images import ImageGenerator
from app.prompts import MODEL_BY_MODE, build_prompt
from app.storage import Storage, make_object_key
from app.worker import celery_app


@celery_app.task(name="generate_coloring_page")
def generate_coloring_page(generation_id: str) -> None:
    storage = Storage()
    generator = ImageGenerator()

    with Session(engine) as session:
        generation = session.get(Generation, UUID(generation_id))
        if not generation:
            return

        generation.status = GenerationStatus.processing
        generation.updated_at = utcnow()
        session.add(generation)
        session.commit()

        try:
            source = storage.get_bytes(generation.source_key)
            prompt = build_prompt(generation.mode, generation.age_level, generation.story)
            model_name = MODEL_BY_MODE[generation.mode]
            png_data = generator.generate_coloring_page(source, prompt, model_name)
            pdf_data = create_a4_pdf(png_data)

            png_key = make_object_key("results/png", "png")
            pdf_key = make_object_key("results/pdf", "pdf")
            storage.put_bytes(png_key, png_data, "image/png")
            storage.put_bytes(pdf_key, pdf_data, "application/pdf")

            generation.status = GenerationStatus.completed
            generation.png_key = png_key
            generation.pdf_key = pdf_key
            generation.generation_metadata = {"model": model_name}
        except Exception as exc:
            generation.status = GenerationStatus.failed
            generation.error_message = str(exc)
            session.add(ErrorLog(generation_id=generation.id, message=str(exc), context={"task": "generate"}))
        finally:
            generation.updated_at = utcnow()
            session.add(generation)
            session.commit()
