from typing import Any


def build_generation_prompt(
    brief: dict[str, Any],
    product_type: str,
) -> str:
    """Build an image-generation prompt from the collection brief."""

    if product_type != "bath_mat":
        raise ValueError(f"Unsupported product type: {product_type}")

    selected_colors = brief.get("desired_colors") or []

    prompt = f"""
You are a professional home textile product designer.

Create ONE original bath mat concept for a home textile collection.

COLLECTION BRIEF:
Concept: {brief.get("concept") or "Not specified"}
Selected colors (HEX): {", ".join(selected_colors) or "Not specified"}
Pattern direction: {brief.get("pattern_direction") or "Not specified"}
Mood: {brief.get("mood") or "Not specified"}
Special instructions: {brief.get("special_instructions") or "None"}

PRODUCT REQUIREMENTS:
- The design must clearly be a bath mat.
- Create a realistic and manufacturable textile product.
- Show the complete shape and edges of the bath mat.
- Make the pile, fibers, and surface texture clearly visible.
- Use the selected colors as the primary palette when provided.
- Interpret the collection brief creatively.
- Do not add logos, text, labels, or watermarks.

IMAGE PRESENTATION:
- Show one bath mat only.
- Use a clean, neutral background.
- Use professional product photography presentation.
- Use soft, even studio lighting.
- Keep the bath mat as the clear focal point.
- Do not include additional products or decorative objects.

Generate one original bath mat product concept image.
"""

    return prompt.strip()