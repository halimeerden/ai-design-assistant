import json
from uuid import UUID

from google import genai

from app.core.config import get_settings
from app.core.supabase import get_supabase_client
from app.schemas.brands import BrandDNA


def generate_brand_dna(brand_id: UUID) -> BrandDNA:
    supabase = get_supabase_client()

    assets_response = (
        supabase
        .table("brand_assets")
        .select("analysis_result")
        .eq("brand_id", str(brand_id))
        .eq("asset_type", "brand_reference")
        .not_.is_("analysis_result", "null")
        .execute()
    )

    analyses = [
        asset["analysis_result"]
        for asset in assets_response.data or []
        if asset.get("analysis_result")
    ]

    if not analyses:
        raise ValueError("No analyzed brand assets found.")

    settings = get_settings()

    client = genai.Client(
        api_key=settings.gemini_api_key,
    )

    prompt = f"""
You are analyzing the visual identity of a textile brand.

Below are structured analyses of multiple historical product images.

Identify the recurring visual characteristics across the collection.

Do not simply concatenate the values.
Infer the most representative brand-level patterns.

Image analyses:

{json.dumps(analyses, ensure_ascii=False)}

Create a concise Brand DNA containing:
- dominant colors
- visual styles
- common patterns
- common textures
- fringe usage
"""

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_json_schema": BrandDNA.model_json_schema(),
        },
    )

    return BrandDNA.model_validate_json(response.text)