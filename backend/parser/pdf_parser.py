import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io


def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract all text from a PDF, including OCR on image pages."""
    doc = fitz.open(pdf_path)
    full_text = []

    for page in doc:
        # Try direct text extraction first
        text = page.get_text("text")
        if text.strip():
            full_text.append(text)
        else:
            # Fallback to OCR
            pix = page.get_pixmap(dpi=200)
            img = Image.open(io.BytesIO(pix.tobytes("png")))
            ocr_text = pytesseract.image_to_string(img)
            if ocr_text.strip():
                full_text.append(ocr_text)

        # Also OCR embedded images on text pages (screenshots with commands)
        for img_info in page.get_images(full=True):
            xref = img_info[0]
            base_image = doc.extract_image(xref)
            img_bytes = base_image["image"]
            img = Image.open(io.BytesIO(img_bytes))
            # Only OCR reasonably sized images (skip tiny icons)
            if img.width > 200 and img.height > 50:
                try:
                    ocr_text = pytesseract.image_to_string(img, config="--psm 6")
                    if ocr_text.strip():
                        full_text.append(ocr_text)
                except Exception:
                    pass

    doc.close()
    return "\n".join(full_text)
