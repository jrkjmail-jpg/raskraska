from app.models import AgeLevel, GenerationMode


FREE_BASE_PROMPT = """Create a clean black-and-white coloring book page from the uploaded image.

Requirements:
- white background
- thick black outlines
- no grayscale
- no shading
- no shadows
- no color
- printable coloring book style
- preserve likeness of the subject
- child-friendly design
- large coloring areas
- simplified details

Output must look like a professional coloring book page."""


AGE_INSTRUCTIONS = {
    AgeLevel.preschool: "Use very thick lines, very few details, and large simple coloring areas for ages 3-5.",
    AgeLevel.junior: "Use medium detail, clear recognizable shapes, and balanced coloring areas for ages 6-8.",
    AgeLevel.senior: "Use high detail while keeping clean printable outlines for ages 9 and older.",
}


MODE_INSTRUCTIONS = {
    GenerationMode.free: "",
    GenerationMode.premium: (
        "First reinterpret the uploaded photo as a cute polished cartoon illustration, "
        "then convert it into a black-and-white printable coloring book page."
    ),
    GenerationMode.premium_plus: (
        "Create a new fantasy or role-play scene based on the selected story. Preserve the subject's likeness, "
        "then convert the scene into a black-and-white printable coloring book page."
    ),
}


MODEL_BY_MODE = {
    GenerationMode.free: "gpt-image-1-mini",
    GenerationMode.premium: "gpt-image-1.5",
    GenerationMode.premium_plus: "gpt-image-1.5",
}


def build_prompt(mode: GenerationMode, age_level: AgeLevel, story: str | None = None) -> str:
    parts = [FREE_BASE_PROMPT, AGE_INSTRUCTIONS[age_level]]
    mode_instruction = MODE_INSTRUCTIONS[mode]
    if mode_instruction:
        parts.append(mode_instruction)
    if mode == GenerationMode.premium_plus and story:
        parts.append(f"Story theme: {story}.")
    return "\n\n".join(parts)
