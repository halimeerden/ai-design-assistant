from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


MAX_CONCEPTS = 4
DEFAULT_CONCEPTS = 4


class DesignBriefCreate(BaseModel):
    concept: str
    desired_colors: list[str] = []
    pattern_direction: str | None = None
    mood: str | None = None
    special_instructions: str | None = None
    number_of_concepts: int = Field(
        default=DEFAULT_CONCEPTS,
        ge=1,
        le=MAX_CONCEPTS,
    )


class DesignBriefResponse(BaseModel):
    id: UUID
    project_id: UUID
    concept: str
    desired_colors: list[str]
    pattern_direction: str | None
    mood: str | None
    special_instructions: str | None
    number_of_concepts: int
    created_at: datetime