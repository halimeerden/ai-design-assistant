from fastapi import APIRouter, HTTPException
from postgrest.exceptions import APIError

from app.core.supabase import get_supabase_client
from app.schemas.projects import ProjectCreate, ProjectResponse

router = APIRouter(tags=["projects"])


@router.post("/projects", status_code=201, response_model=ProjectResponse)
def create_project(project: ProjectCreate) -> ProjectResponse:
    payload = {
        "brand_id": str(project.brand_id),
        "name": project.name,
        "description": project.description,
        "product_type": project.product_type,
    }

    try:
        response = (
            get_supabase_client()
            .table("design_projects")
            .insert(payload)
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=500,
                detail="Project was created but no data was returned.",
            )

        return ProjectResponse.model_validate(response.data[0])
    except APIError:
        raise HTTPException(
            status_code=502,
            detail="Failed to create project in the database.",
        )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while creating the project.",
        )
