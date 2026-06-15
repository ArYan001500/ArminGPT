from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"


def font(size: int) -> ImageFont.FreeTypeFont:
    candidates = [
        Path("C:/Windows/Fonts/arialbd.ttf"),
        Path("C:/Windows/Fonts/segoeuib.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default()


def gradient_background(size: int) -> Image.Image:
    image = Image.new("RGBA", (size, size))
    pixels = image.load()
    for y in range(size):
        t = y / max(size - 1, 1)
        for x in range(size):
            glow = max(0.0, 1.0 - (((x - size * 0.22) ** 2 + (y - size * 0.18) ** 2) ** 0.5) / size)
            pixels[x, y] = (
                int(5 + 7 * t + 4 * glow),
                int(12 + 5 * t + 18 * glow),
                int(25 + 24 * t + 24 * glow),
                255,
            )
    return image


def draw_logo(canvas: Image.Image, center: tuple[int, int], diameter: int, monochrome: bool = False) -> None:
    cx, cy = center
    ring_box = (
        cx - diameter // 2,
        cy - diameter // 2,
        cx + diameter // 2,
        cy + diameter // 2,
    )
    ring_color = (255, 255, 255, 175) if monochrome else (55, 229, 207, 125)

    glow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse(ring_box, fill=(29, 211, 176, 95 if not monochrome else 50))
    glow = glow.filter(ImageFilter.GaussianBlur(diameter // 4))
    canvas.alpha_composite(glow)

    rings = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    rings_draw = ImageDraw.Draw(rings)
    width = max(3, diameter // 85)
    narrow = diameter * 0.55
    for angle in (28, -32, 88):
        ring = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
        ring_draw = ImageDraw.Draw(ring)
        box = (
            cx - int(narrow / 2),
            cy - diameter // 2,
            cx + int(narrow / 2),
            cy + diameter // 2,
        )
        ring_draw.ellipse(box, outline=ring_color, width=width)
        ring = ring.rotate(angle, center=(cx, cy), resample=Image.Resampling.BICUBIC)
        rings.alpha_composite(ring)
    canvas.alpha_composite(rings)

    core_size = int(diameter * 0.58)
    core = Image.new("RGBA", (core_size, core_size), (0, 0, 0, 0))
    core_pixels = core.load()
    for y in range(core_size):
        t = y / max(core_size - 1, 1)
        for x in range(core_size):
            dx = x - core_size / 2
            dy = y - core_size / 2
            if dx * dx + dy * dy <= (core_size / 2) ** 2:
                if monochrome:
                    core_pixels[x, y] = (255, 255, 255, 255)
                else:
                    core_pixels[x, y] = (
                        int(29 + 95 * t),
                        int(211 - 119 * t),
                        int(176 + 79 * t),
                        255,
                    )
    canvas.alpha_composite(core, (cx - core_size // 2, cy - core_size // 2))

    draw = ImageDraw.Draw(canvas)
    letter_font = font(int(core_size * 0.48))
    text = "A"
    bbox = draw.textbbox((0, 0), text, font=letter_font)
    position = (cx - (bbox[2] - bbox[0]) / 2, cy - (bbox[3] - bbox[1]) / 2 - bbox[1])
    draw.text(position, text, font=letter_font, fill=(7, 17, 31, 255) if not monochrome else (7, 17, 31, 255))


def make_icon() -> None:
    image = gradient_background(1024)
    draw_logo(image, (512, 500), 570)
    image.save(ASSETS / "icon.png")


def make_splash() -> None:
    image = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    draw_logo(image, (256, 256), 330)
    image.save(ASSETS / "splash-icon.png")


def make_android_assets() -> None:
    background = gradient_background(1024)
    background.save(ASSETS / "android-icon-background.png")

    foreground = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    draw_logo(foreground, (512, 512), 500)
    foreground.save(ASSETS / "android-icon-foreground.png")

    monochrome = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    draw_logo(monochrome, (512, 512), 500, monochrome=True)
    monochrome.save(ASSETS / "android-icon-monochrome.png")


def make_favicon() -> None:
    image = gradient_background(128)
    draw_logo(image, (64, 64), 92)
    image.save(ASSETS / "favicon.png")


ASSETS.mkdir(exist_ok=True)
make_icon()
make_splash()
make_android_assets()
make_favicon()
print("Brand assets generated.")
