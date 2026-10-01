from uuid import UUID

from app.services.generation.mock import MockImageGenerator
from app.services.generation.prompt_builder import build_generation_prompt
from app.services.generation.storage import (
    save_generated_design,
    save_generated_image,
)


def generate_design(
    design_request_id: UUID,
    brief: dict,
    product_type: str = "bath_mat",
) -> dict:
    prompt = build_generation_prompt(
        brief=brief,
        product_type=product_type,
    )

    generator = MockImageGenerator()

    image_bytes = generator.generate_image(prompt)

    storage_bucket, storage_path = save_generated_image(
        image_bytes=image_bytes,
        design_request_id=design_request_id,
    )

    generated_design = save_generated_design(
        design_request_id=design_request_id,
        storage_bucket=storage_bucket,
        storage_path=storage_path,
        generation_prompt=prompt,
        model_name="mock",
    )

    return generated_design