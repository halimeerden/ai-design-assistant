from uuid import UUID

from fastapi import APIRouter, HTTPException
from postgrest.exceptions import APIError
from pydantic import BaseModel

from app.core.supabase import get_supabase_client
from app.services.generation.service import generate_collection_designs


router = APIRouter(tags=["generation"])


class GenerationRequestCreate(BaseModel):
    brief_id: UUID


class GenerationRequestResponse(BaseModel):
    id: UUID
    project_id: UUID
    request_type: str
    status: str


@router.post(
    "/projects/{project_id}/generate",
    status_code=201,
    response_model=GenerationRequestResponse,
)
def create_generation_request(
    project_id: UUID,
    payload: GenerationRequestCreate,
) -> GenerationRequestResponse:

    supabase = get_supabase_client()

    try:
        project_response = (
            supabase.table("design_projects")
            .select("id")
            .eq("id", str(project_id))
            .limit(1)
            .execute()
        )

        if not project_response.data:
            raise HTTPException(
                status_code=404,
                detail="Project not found.",
            )

        brief_response = (
            supabase.table("design_briefs")
            .select("*")
            .eq("id", str(payload.brief_id))
            .eq("project_id", str(project_id))
            .limit(1)
            .execute()
        )

        if not brief_response.data:
            raise HTTPException(
                status_code=404,
                detail="Design brief not found for this project.",
            )

        brief = brief_response.data[0]

        moodboard_response = (
            supabase.table("brand_assets")
            .select("storage_path")
            .eq("project_id", str(project_id))
            .eq("asset_type", "moodboard")
            .execute()
        )

        moodboard_paths = [
            asset["storage_path"]
            for asset in (moodboard_response.data or [])
        ]

        request_payload = {
            "project_id": str(project_id),
            "request_type": "generate",
            "user_prompt": brief["concept"],
            "color_palette": brief["desired_colors"],
            "moodboard_paths": moodboard_paths,
            "status": "pending",
        }

        request_response = (
            supabase.table("design_requests")
            .insert(request_payload)
            .execute()
        )

        if not request_response.data:
            raise HTTPException(
                status_code=500,
                detail="Generation request was not created.",
            )

        request = request_response.data[0]
        request_id = request["id"]

    except HTTPException:
        raise
    except APIError:
        raise HTTPException(
            status_code=502,
            detail="Failed to create generation request.",
        )
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while creating the generation request.",
        )

    try:
        supabase.table("design_requests").update(
            {"status": "processing"}
        ).eq("id", request_id).execute()

        generate_collection_designs(
      design_request_id=request_id,
     brief=brief,
     product_type="bath_mat",
)

        completed_response = (
            supabase.table("design_requests")
            .update({"status": "completed"})
            .eq("id", request_id)
            .execute()
        )

        if not completed_response.data:
            raise RuntimeError(
                "Generation request status was not updated."
            )

        return GenerationRequestResponse.model_validate(
            completed_response.data[0]
        )

    except Exception:
        try:
            supabase.table("design_requests").update(
                {"status": "failed"}
            ).eq("id", request_id).execute()
        except Exception:
            pass

        raise HTTPException(
            status_code=500,
            detail="Mock image generation failed. Check backend logs.",
        )