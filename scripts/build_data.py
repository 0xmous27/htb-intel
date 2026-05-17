#!/usr/bin/env python3
"""
Pipeline: 28 HTB PDFs → structured output.json
Run: python build_data.py
"""

import json
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from parser.pdf_parser import extract_text_from_pdf
from parser.command_extractor import extract_commands, infer_name, infer_purpose, infer_when
from parser.categorizer import categorize
from utils.cleaner import clean_text

PDF_DIR = Path("/home/oxmous/HTB-PT/HTB-PT")
OUTPUT = Path(__file__).parent / "data" / "output.json"

def build():
    pdfs = sorted(PDF_DIR.glob("*.pdf"))
    print(f"Found {len(pdfs)} PDFs")

    # category → list of techniques
    categories: dict[str, list] = {}
    seen_commands: set[str] = set()

    for pdf in pdfs:
        module_name = pdf.stem
        print(f"  Processing: {module_name}")
        try:
            raw = extract_text_from_pdf(str(pdf))
            text = clean_text(raw)
        except Exception as e:
            print(f"    ERROR: {e}")
            continue

        extracted = extract_commands(text)
        print(f"    → {len(extracted)} commands found")

        for item in extracted:
            cmd = item["raw_command"]
            ctx = item["context"]

            # Deduplicate
            if cmd in seen_commands:
                continue
            seen_commands.add(cmd)

            category = categorize(ctx + " " + cmd, cmd)
            name = infer_name(cmd, ctx)
            purpose = infer_purpose(cmd, ctx)
            when = infer_when(cmd, category)

            # Build tags from first word + category keywords
            tags = [category.lower().replace(" ", "_")]
            first_word = cmd.split()[0].lower().lstrip("$#") if cmd.split() else ""
            if first_word:
                tags.append(first_word)

            technique = {
                "id": f"{category}_{len(seen_commands)}",
                "name": name,
                "purpose": purpose,
                "when_to_use": when,
                "command": cmd,
                "source": module_name,
                "tags": list(set(tags)),
            }

            categories.setdefault(category, []).append(technique)

    # Build final structure
    output = [
        {"category": cat, "techniques": techs}
        for cat, techs in sorted(categories.items())
    ]

    OUTPUT.parent.mkdir(exist_ok=True)
    with open(OUTPUT, "w") as f:
        json.dump(output, f, indent=2)

    total = sum(len(c["techniques"]) for c in output)
    print(f"\nDone. {total} techniques across {len(output)} categories → {OUTPUT}")


if __name__ == "__main__":
    build()
