from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class BrandAssetResponse(BaseModel):
    id: UUID
    brand_id: UUID
    project_id: UUID | None
    file_name: str
    storage_bucket: str
    storage_path: str
    asset_type: str
    analysis_result: dict | None
    created_at: datetime