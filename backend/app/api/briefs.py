from uuid import UUID

from fastapi import APIRouter, HTTPException
from postgrest.exceptions import APIError

from app.core.supabase import get_supabase_client
from app.schemas.briefs import DesignBriefCreate, DesignBriefResponse


router = APIRouter(tags=["briefs"])


@router.post(
    "/projects/{project_id}/briefs",
    status_code=201,
    response_model=DesignBriefResponse,
)
def create_design_brief(
    project_id: UUID,
    brief: DesignBriefCreate,
) -> DesignBriefResponse:
    supabase = get_supabase_client()

    try:
        project_response = (
            supabase
            .table("design_projects")
            .select("id")
            .eq("id", str(project_id))
            .single()
            .execute()
        )

        if not project_response.data:
            raise HTTPException(
                status_code=404,
                detail="Project not found.",
            )

        payload = {
            "project_id": str(project_id),
            "concept": brief.concept,
            "desired_colors": brief.desired_colors,
            "pattern_direction": brief.pattern_direction,
            "mood": brief.mood,
            "special_instructions": brief.special_instructions,
            "number_of_concepts": brief.number_of_concepts,
        }

        response = (
            supabase
            .table("design_briefs")
            .insert(payload)
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=500,
                detail="Design brief was created but no data was returned.",
            )

        return DesignBriefResponse.model_validate(
            response.data[0]
        )

    except APIError:
        raise HTTPException(
            status_code=502,
            detail="Failed to create design brief.",
        )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while creating the design brief.",
        )