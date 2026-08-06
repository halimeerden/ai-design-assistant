from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ProjectCreate(BaseModel):
    brand_id: UUID
    name: str
    description: str | None = None
    product_type: str = "bath_mat"


class ProjectResponse(BaseModel):
    id: UUID
    brand_id: UUID
    name: str
    description: str | None
    product_type: str
    status: str
    created_at: datetime
    updated_at: datetime
