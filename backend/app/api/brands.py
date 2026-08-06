from typing import Any

from fastapi import APIRouter, HTTPException
from postgrest.exceptions import APIError

from app.core.supabase import get_supabase_client

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
