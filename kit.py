#!/usr/bin/env python3
"""Ritar ikoner, favicon, og-bild, manifest, robots och sitemap för Ordklassjakten.
Tre former: en blå ordbricka med vit linje, ett förstoringsglas med glugg. Inga tunna streck,
så formen överlever 48 px."""
import json
import pathlib

from PIL import Image, ImageDraw

P = pathlib.Path(__file__).parent / "public"
P.mkdir(exist_ok=True)
PAPPER = (250, 247, 242, 255)
BLA = (47, 111, 143, 255)
MORK = (20, 26, 34, 255)
ORANGE = (194, 70, 28, 255)
VIT = (255, 255, 255, 255)


def rre(d, box, r, fill):
    d.rounded_rectangle(box, radius=r, fill=fill)


def ikon(N, bakgrund=True):
    img = Image.new("RGBA", (N, N), PAPPER if bakgrund else (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # ordbrickan
    rre(d, (N * 0.10, N * 0.20, N * 0.90, N * 0.66), N * 0.10, BLA)
    # orden: två vita streck
    d.rounded_rectangle((N * 0.20, N * 0.31, N * 0.62, N * 0.38), radius=N * 0.035, fill=VIT)
    d.rounded_rectangle((N * 0.20, N * 0.47, N * 0.50, N * 0.54), radius=N * 0.035, fill=VIT)
    # förstoringsglaset
    cx, cy, r = N * 0.63, N * 0.68, N * 0.20
    lw = N * 0.075
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=VIT)
    d.ellipse((cx - r + lw, cy - r + lw, cx + r - lw, cy + r - lw), fill=ORANGE)
    # handtaget
    d.line((cx + r * 0.72, cy + r * 0.72, N * 0.93, N * 0.93), fill=MORK, width=int(N * 0.10))
    return img


def og():
    W, H = 1200, 630
    img = Image.new("RGBA", (W, H), PAPPER)
    d = ImageDraw.Draw(img)
    ik = ikon(300)
    img.paste(ik, (90, int(H / 2 - 150)), ik)
    d.rounded_rectangle((440, 210, 1110, 300), radius=18, fill=BLA)
    d.rounded_rectangle((470, 240, 900, 262), radius=10, fill=VIT)
    d.rounded_rectangle((470, 275, 780, 292), radius=8, fill=(214, 232, 240, 255))
    d.text((440, 360), "Vilken ordklass är ordet?", fill=MORK)
    d.text((440, 400), "substantiv · verb · adjektiv · pronomen", fill=BLA)
    return img


def main():
    for n in (192, 512):
        ikon(n).save(P / f"icon-{n}.png")
    ikon(192).save(P / "apple-touch-icon.png")
    ikon(512).save(P / "favicon.png")
    # maskable: motivet inom 80 % säker zon
    m = Image.new("RGBA", (512, 512), BLA)
    liten = ikon(360, bakgrund=False)
    m.paste(liten, (76, 76), liten)
    m.save(P / "icon-maskable-512.png")
    og().save(P / "og.png")

    (P / "favicon.svg").write_text(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'
        '<rect width="64" height="64" rx="12" fill="#faf7f2"/>'
        '<rect x="6" y="13" width="52" height="30" rx="7" fill="#2f6f8f"/>'
        '<rect x="13" y="20" width="27" height="6" rx="3" fill="#fff"/>'
        '<rect x="13" y="31" width="19" height="6" rx="3" fill="#fff"/>'
        '<circle cx="41" cy="44" r="13" fill="#fff"/>'
        '<circle cx="41" cy="44" r="8" fill="#c2461c"/>'
        '<path d="M50 53 L60 60" stroke="#141a22" stroke-width="7" stroke-linecap="round"/>'
        '</svg>\n', encoding="utf-8")

    (P / "site.webmanifest").write_text(json.dumps({
        "name": "Ordklassjakten",
        "short_name": "Ordklassjakten",
        "description": "Vilken ordklass är ordet? Substantiv, verb, adjektiv och pronomen i riktiga meningar. Svenska åk 4–6.",
        "lang": "sv",
        "start_url": "/",
        "display": "standalone",
        "orientation": "any",
        "background_color": "#faf7f2",
        "theme_color": "#faf7f2",
        "icons": [
            {"src": "icon-192.png", "sizes": "192x192", "type": "image/png"},
            {"src": "icon-512.png", "sizes": "512x512", "type": "image/png"},
            {"src": "icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
        ],
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    (P / "robots.txt").write_text("User-agent: *\nAllow: /\n", encoding="utf-8")
    (P / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        '  <url><loc>https://ordklassjakten.shipholm.dev/</loc><lastmod>2026-11-25</lastmod></url>\n'
        '</urlset>\n', encoding="utf-8")
    print("klart:", sorted(p.name for p in P.iterdir()))


if __name__ == "__main__":
    main()