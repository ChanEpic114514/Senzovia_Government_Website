"""Additional Kamotish interface translations, kept as editable JSON."""
import json
from pathlib import Path

LABELS = json.loads((Path(__file__).parent / "kamotish-ui.json").read_text(encoding="utf-8"))
