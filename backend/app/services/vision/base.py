from typing import Protocol

from pydantic import BaseModel


class ImageAnalysisResult(BaseModel):
    dominant_colors: list[str]
    style: str
    pattern: str
    texture: str
    has_fringe: bool


class VisionProvider(Protocol):
    def analyze_image(
        self,
        image_bytes: bytes,
        mime_type: str,
    ) -> ImageAnalysisResult:
        ...