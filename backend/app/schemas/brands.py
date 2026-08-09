from pydantic import BaseModel


class BrandDNA(BaseModel):
    dominant_colors: list[str]
    visual_styles: list[str]
    common_patterns: list[str]
    common_textures: list[str]
    fringe_usage: str