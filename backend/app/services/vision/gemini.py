from google import genai
from google.genai import types

from app.core.config import get_settings
from app.services.vision.base import ImageAnalysisResult


class GeminiVisionProvider:
    def __init__(self) -> None:
        settings = get_settings()

        self.client = genai.Client(
            api_key=settings.gemini_api_key,
        )

    def analyze_image(
        self,
        image_bytes: bytes,
        mime_type: str,
    ) -> ImageAnalysisResult:

        prompt = """
Analyze this textile product image.

Return:
- dominant colors
- overall visual style
- pattern description
- texture description
- whether the product has fringe/tassels

Focus on the product itself, not the background or photography style.
"""

        image_part = types.Part.from_bytes(
            data=image_bytes,
            mime_type=mime_type,
        )

        response = self.client.models.generate_content(
            model="gemini-3.6-flash",
            contents=[
                prompt,
                image_part,
            ],
            config={
                "response_mime_type": "application/json",
                "response_json_schema": ImageAnalysisResult.model_json_schema(),
            },
        )

        return ImageAnalysisResult.model_validate_json(response.text)