from pathlib import Path
from uuid import UUID, uuid4

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from postgrest.exceptions import APIError

from app.core.supabase import get_supabase_client
from app.schemas.assets import BrandAssetResponse

from app.services.vision import get_vision_provider

router = APIRouter(tags=["assets"])

ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}

MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB

ALLOWED_ASSET_TYPES = {
    "brand_reference",
    "moodboard",
    "edit_source",
}

@router.post(
    "/projects/{project_id}/assets",
    status_code=201,
    response_model=BrandAssetResponse,
)
async def upload_project_asset(
    project_id: UUID,
    asset_type: str = Form(...),
    file: UploadFile = File(...),
) -> BrandAssetResponse:


    if asset_type not in ALLOWED_ASSET_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Invalid asset type.",
        )

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
            "asset_type": asset_type,
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

@router.post(
    "/assets/{asset_id}/analyze",
    response_model=BrandAssetResponse,
)
def analyze_asset(asset_id: UUID) -> BrandAssetResponse:
    supabase = get_supabase_client()

    try:
        asset_response = (
            supabase
            .table("brand_assets")
            .select("*")
            .eq("id", str(asset_id))
            .single()
            .execute()
        )

        asset = asset_response.data

        if not asset:
            raise HTTPException(
                status_code=404,
                detail="Asset not found.",
            )

        image_bytes = (
            supabase.storage
            .from_(asset["storage_bucket"])
            .download(asset["storage_path"])
        )

        file_name = asset["file_name"].lower()

        if file_name.endswith((".jpg", ".jpeg")):
            mime_type = "image/jpeg"
        elif file_name.endswith(".png"):
            mime_type = "image/png"
        elif file_name.endswith(".webp"):
            mime_type = "image/webp"
        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported image type.",
            )

        vision_provider = get_vision_provider()

        analysis = vision_provider.analyze_image(
            image_bytes=image_bytes,
            mime_type=mime_type,
        )

        update_response = (
            supabase
            .table("brand_assets")
            .update(
                {
                    "analysis_result": analysis.model_dump(),
                }
            )
            .eq("id", str(asset_id))
            .execute()
        )

        if not update_response.data:
            raise HTTPException(
                status_code=500,
                detail="Analysis completed but could not be saved.",
            )

        return BrandAssetResponse.model_validate(
            update_response.data[0]
        )

    except APIError:
        raise HTTPException(
            status_code=502,
            detail="Failed to analyze asset.",
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
            #detail="An unexpected error occurred while analyzing the asset.",
        )