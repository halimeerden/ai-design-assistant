from pathlib import Path
from uuid import UUID, uuid4

from fastapi import APIRouter, File, HTTPException, UploadFile
from postgrest.exceptions import APIError

from app.core.supabase import get_supabase_client
from app.schemas.assets import BrandAssetResponse

router = APIRouter(tags=["assets"])

ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}

MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB


@router.post(
    "/projects/{project_id}/assets",
    status_code=201,
    response_model=BrandAssetResponse,
)
async def upload_project_asset(
    project_id: UUID,
    file: UploadFile = File(...),
) -> BrandAssetResponse:
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only JPEG, PNG, and WEBP images are allowed.",
        )

    file_bytes = await file.read()

    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size must be 20 MB or smaller.",
        )

    supabase = get_supabase_client()

    try:
        project_response = (
            supabase
            .table("design_projects")
            .select("id, brand_id")
            .eq("id", str(project_id))
            .single()
            .execute()
        )

        project = project_response.data

        if not project:
            raise HTTPException(
                status_code=404,
                detail="Project not found.",
            )

        original_name = file.filename or "image"
        extension = Path(original_name).suffix.lower()

        storage_path = (
            f"{project['brand_id']}/"
            f"{project_id}/"
            f"{uuid4()}{extension}"
        )

        supabase.storage.from_("brand-assets").upload(
            storage_path,
            file_bytes,
            {
                "content-type": file.content_type,
                "upsert": "false",
            },
        )

        asset_payload = {
            "brand_id": project["brand_id"],
            "project_id": str(project_id),
            "file_name": original_name,
            "storage_bucket": "brand-assets",
            "storage_path": storage_path,
            "asset_type": "product_image",
        }

        asset_response = (
            supabase
            .table("brand_assets")
            .insert(asset_payload)
            .execute()
        )

        if not asset_response.data:
            raise HTTPException(
                status_code=500,
                detail="Image uploaded but asset metadata was not created.",
            )

        return BrandAssetResponse.model_validate(asset_response.data[0])

    except APIError:
        raise HTTPException(
            status_code=502,
            detail="Failed to upload asset.",
        )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while uploading the asset.",
        )