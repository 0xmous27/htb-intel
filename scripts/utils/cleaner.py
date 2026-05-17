import re


def clean_text(text: str) -> str:
    # Remove page numbers, headers/footers patterns
    text = re.sub(r"\n\s*\d+\s*\n", "\n", text)
    # Collapse excessive whitespace but preserve newlines
    text = re.sub(r"[ \t]{2,}", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    # Remove non-printable chars except newline/tab
    text = re.sub(r"[^\x09\x0A\x20-\x7E]", "", text)
    return text.strip()
