from io import BytesIO

import cv2
import numpy as np
from PIL import Image
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas


def normalize_uploaded_image(data: bytes) -> bytes:
    image = Image.open(BytesIO(data)).convert("RGB")
    image.thumbnail((2048, 2048))
    output = BytesIO()
    image.save(output, format="PNG", optimize=True)
    return output.getvalue()


def fallback_coloring_page(data: bytes) -> bytes:
    image = Image.open(BytesIO(data)).convert("RGB")
    array = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2GRAY)
    blurred = cv2.bilateralFilter(array, 9, 75, 75)
    edges = cv2.Canny(blurred, 40, 120)
    edges = cv2.dilate(edges, np.ones((2, 2), np.uint8), iterations=1)
    inverted = 255 - edges
    output_image = Image.fromarray(inverted).convert("L")
    output = BytesIO()
    output_image.save(output, format="PNG", dpi=(300, 300))
    return output.getvalue()


def create_a4_pdf(png_data: bytes) -> bytes:
    page_width, page_height = A4
    margin = 36
    image = Image.open(BytesIO(png_data)).convert("RGB")
    image_width, image_height = image.size
    max_width = page_width - margin * 2
    max_height = page_height - margin * 2
    scale = min(max_width / image_width, max_height / image_height)
    draw_width = image_width * scale
    draw_height = image_height * scale
    x = (page_width - draw_width) / 2
    y = (page_height - draw_height) / 2

    image_buffer = BytesIO()
    image.save(image_buffer, format="PNG", dpi=(300, 300))
    image_buffer.seek(0)

    output = BytesIO()
    pdf = canvas.Canvas(output, pagesize=A4)
    pdf.drawImage(
        ImageReader(image_buffer),
        x,
        y,
        width=draw_width,
        height=draw_height,
        preserveAspectRatio=True,
        mask="auto",
    )
    pdf.showPage()
    pdf.save()
    return output.getvalue()
