from google import genai
from google.genai import types

from app.core.config import get_settings


class GeminiImageGenerator:
    def __init__(self) -> None:
        settings = get_settings()

        self.client = genai.Client(
            api_key=settings.gemini_api_key
        )

        self.model = settings.ai_image_model

    def generate_image(self, prompt: str) -> bytes:
        response = self.client.models.generate_content(
            model=self.model,
            contents=[prompt],
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE"],
            ),
        )

        for candidate in response.candidates or []:
            if not candidate.content:
                continue

            for part in candidate.content.parts or []:
                if part.inline_data and part.inline_data.data:
                    return part.inline_data.data

        raise RuntimeError(
            "Gemini did not return an image."
        )