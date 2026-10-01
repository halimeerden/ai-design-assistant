from uuid import UUID, uuid4

from app.core.supabase import get_supabase_client


GENERATED_IMAGES_BUCKET = "brand-assets"


def save_generated_image(
    image_bytes: bytes,
    design_request_id: UUID,
) -> tuple[str, str]:
    supabase = get_supabase_client()

    storage_path = (
        f"generated/{design_request_id}/{uuid4()}.png"
    )

    supabase.storage.from_(
        GENERATED_IMAGES_BUCKET
    ).upload(
        path=storage_path,
        file=image_bytes,
        file_options={
            "content-type": "image/png",
        },
    )

    return GENERATED_IMAGES_BUCKET, storage_path


def save_generated_design(
    design_request_id: UUID,
    storage_bucket: str,
    storage_path: str,
    generation_prompt: str,
    model_name: str,
) -> dict:
    supabase = get_supabase_client()

    payload = {
        "design_request_id": str(design_request_id),
        "storage_bucket": storage_bucket,
        "storage_path": storage_path,
        "generation_prompt": generation_prompt,
        "model_name": model_name,
    }

    response = (
        supabase.table("generated_designs")
        .insert(payload)
        .execute()
    )

    if not response.data:
        raise RuntimeError(
            "Generated design record was not created."
        )

    return response.data[0]