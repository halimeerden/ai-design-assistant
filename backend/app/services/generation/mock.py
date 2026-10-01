from pathlib import Path


class MockImageGenerator:
    def generate_image(self, prompt: str) -> bytes:
        mock_image_path = Path(__file__).parent / "mock_bath_mat.png"

        if not mock_image_path.exists():
            raise FileNotFoundError(
                "Mock image not found: mock_bath_mat.png"
            )

        return mock_image_path.read_bytes()