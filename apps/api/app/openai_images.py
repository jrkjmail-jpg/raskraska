import base64

from openai import OpenAI

from app.config import get_settings
from app.image_processing import fallback_coloring_page


class ImageGenerator:
    def __init__(self) -> None:
        settings = get_settings()
        self.api_key = settings.openai_api_key
        self.client = OpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None

    def generate_coloring_page(self, image_data: bytes, prompt: str, model: str) -> bytes:
        if not self.client:
            return fallback_coloring_page(image_data)

        # The adapter is intentionally small: if the Images API shape changes,
        # only this module needs to move.
        result = self.client.images.edit(
            model=model,
            image=("source.png", image_data, "image/png"),
            prompt=prompt,
            size="1024x1024",
        )
        encoded = result.data[0].b64_json
        if not encoded:
            return fallback_coloring_page(image_data)
        return base64.b64decode(encoded)
