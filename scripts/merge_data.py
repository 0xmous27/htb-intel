#!/usr/bin/env python3
import json
from pathlib import Path

DATA = Path(__file__).parent / "data"
parts = [
    "deep_part1.json", "deep_part2.json", "deep_part3.json",
    "deep_part4.json", "deep_evasion.json"
]

merged = []
for p in parts:
    merged.extend(json.loads((DATA / p).read_text()))

merged.sort(key=lambda x: x["category"])
(DATA / "output.json").write_text(json.dumps(merged, indent=2))

total = sum(len(c["techniques"]) for c in merged)
print(f"Total: {total} techniques across {len(merged)} categories")
for c in merged:
    print(f"  {c['category']}: {len(c['techniques'])}")
