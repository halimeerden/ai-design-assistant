from app.core.config import get_settings
from app.services.vision.base import VisionProvider
from app.services.vision.gemini import GeminiVisionProvider


def get_vision_provider() -> VisionProvider:
    settings = get_settings()

    if settings.ai_vision_provider == "gemini":
        return GeminiVisionProvider()

    raise ValueError(
        f"Unsupported vision provider: {settings.ai_vision_provider}"
    )