import numpy as np, os, sys
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

U = "/root/.claude/uploads/cc408370-286c-59a5-8423-4d11ed8f6991/"
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "personagens")
os.makedirs(OUT, exist_ok=True)
SRC = {
  "vespasiano_full": "2a2dc21a-image.png", "vespasiano_meio": "ace27cea-image.jpg",
  "tito": "56e25401-image.jpg", "gladiador_vermelho": "ced22f6b-image.jpg",
  "trabalhador": "dc4d66bc-image.jpg", "leao": "a916c427-image.jpg",
  "gladiador_azul": "bc0503cc-image.jpg", "turista": "5c9423ff-image.jpg",
  "cidadaos": "f100772a-image.jpg", "marinheiro": "da2cc368-image.jpg",
}

def cut(path):
    im = Image.open(path).convert("RGB")
    a = np.asarray(im).astype(np.int16)
    mn = a.min(axis=2)
    cand = mn >= 236                      # quase branco
    lab, n = ndi.label(cand)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(border))
    # bolsões brancos puros dentro do personagem (entre braço e corpo etc.)
    pure = mn >= 246
    lab2, n2 = ndi.label(pure & ~bg)
    sizes = ndi.sum(np.ones_like(lab2), lab2, index=np.arange(1, n2 + 1))
    for i, s in enumerate(sizes, 1):
        if s >= 600:
            bg |= lab2 == i
    fg = ~bg
    fg = ndi.binary_opening(fg, iterations=1)
    # mantém só componentes grandes
    lab3, n3 = ndi.label(fg)
    if n3:
        sz = ndi.sum(np.ones_like(lab3), lab3, index=np.arange(1, n3 + 1))
        keep = [i for i, s in enumerate(sz, 1) if s > 0.002 * fg.size]
        fg = np.isin(lab3, keep)
    alpha = Image.fromarray((fg * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.1))
    alpha = alpha.point(lambda v: 0 if v < 70 else (255 if v > 190 else int((v - 70) * 255 / 120)))
    out = im.convert("RGBA"); out.putalpha(alpha)
    return out

def trim(im, pad=6):
    bb = im.getchannel("A").point(lambda v: 255 if v > 10 else 0).getbbox()
    im = im.crop(bb)
    w, h = im.size
    out = Image.new("RGBA", (w + pad * 2, h + pad * 2), (0, 0, 0, 0)); out.paste(im, (pad, pad))
    return out

def save(name, im, maxh=900):
    im = trim(im)
    if im.height > maxh:
        im = im.resize((round(im.width * maxh / im.height), maxh), Image.LANCZOS)
    im.save(os.path.join(OUT, name + ".png"), optimize=True)
    print(name, im.size)

for k, f in SRC.items():
    im = cut(U + f)
    if k == "cidadaos":
        al = np.asarray(im.getchannel("A")) > 10
        cols = al.any(axis=0)
        xs = np.where(cols)[0]
        # separa por vãos de colunas vazias
        groups = []; start = xs[0]; prev = xs[0]
        for x in xs[1:]:
            if x - prev > 12:
                groups.append((start, prev)); start = x
            prev = x
        groups.append((start, prev))
        names = ["cidadao_homem", "cidadao_mulher", "cidadao_crianca", "cidadao_senador"]
        print("groups", groups)
        for (a, b), nm in zip(groups, names):
            save(nm, im.crop((a, 0, b + 1, im.height)), 800)
    else:
        save(k, im, 1100 if k in ("vespasiano_full", "tito") else 800)
