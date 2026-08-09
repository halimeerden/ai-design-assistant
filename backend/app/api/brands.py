from typing import Any

from fastapi import APIRouter, HTTPException
from postgrest.exceptions import APIError

from app.core.supabase import get_supabase_client

from uuid import UUID
from app.services.brand_dna import generate_brand_dna

router = APIRouter(tags=["brands"])


@router.get("/brands")
def list_brands() -> list[dict[str, Any]]:
    try:
        response = get_supabase_client().table("brands").select("*").execute()
        return response.data or []
    except APIError:
        raise HTTPException(
            status_code=502,
            detail="Failed to fetch brands from the database.",
        )
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while fetching brands.",
        )

@router.post("/brands/{brand_id}/analyze")
def analyze_brand(brand_id: UUID):
    try:
        brand_dna = generate_brand_dna(brand_id)

        response = (
            get_supabase_client()
            .table("brands")
            .update(
                {
                    "brand_profile": brand_dna.model_dump(),
                }
            )
            .eq("id", str(brand_id))
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=500,
                detail="Brand DNA was generated but could not be saved.",
            )

        return response.data[0]

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )
    except APIError:
        raise HTTPException(
            status_code=502,
            detail="Failed to update brand profile.",
        )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while generating Brand DNA.",
        )