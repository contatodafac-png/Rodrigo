# Gera, a partir do recorte da referência (livy-base-recorte.png), uma base para cada personagem do elenco:
# recolore pele / cabelo / olhos preservando o sombreado original e (opcional) encurta o cabelo.
# Uso: python3 variantes.py   (lê ../base/livy-base-recorte.png, grava ../base/<nome>-base.png)
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi
import colorsys, os

HERE = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.join(HERE, '..', 'base')
src = np.array(Image.open(os.path.join(BASE, 'livy-base-recorte.png')).convert('RGBA')).astype(float)
H, W = src.shape[:2]
REF_SKIN = np.array([255, 222, 184], float)
OUTLINE = np.array([22, 18, 26], float)
hexrgb = lambda h: np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], float)

yy, xx = np.mgrid[0:H, 0:W]
EYE_L = (xx > 100) & (xx < 216) & (yy > 278) & (yy < 362)
EYE_R = (xx > 302) & (xx < 412) & (yy > 278) & (yy < 362)
MOUTH = (xx > 214) & (xx < 304) & (yy > 424) & (yy < 462)
FACE_PTS = [(118, 200), (117, 312), (122, 372), (150, 440), (200, 490), (256, 508), (312, 490), (362, 440), (390, 372), (395, 312), (394, 200)]
_fm = Image.new('L', (514, 640), 0); ImageDraw.Draw(_fm).polygon(FACE_PTS, fill=255)
FACE_POLY = np.array(_fm) > 0
PROTECT = (EYE_L | EYE_R | MOUTH) & ndi.binary_dilation(FACE_POLY, iterations=1)

rgb = src[..., :3]
a = src[..., 3]
mx, mn = rgb.max(axis=2), rgb.min(axis=2)
lum = rgb.mean(axis=2)
sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1), 0)

hair_m = (sat < 0.06) & (lum > 140) & ~PROTECT & (a > 10)
skin_m = (sat > 0.10) & (sat < 0.55) & (rgb[..., 0] > rgb[..., 1]) & (rgb[..., 1] > rgb[..., 2]) & (lum > 120) & (a > 10)
iris_m = (sat >= 0.55) & (rgb[..., 0] > 150) & (EYE_L | EYE_R)
blush_m = skin_m & (rgb[..., 1] < 205) & (rgb[..., 2] < 190) & (rgb[..., 0] > 235) & (yy > 360) & (yy < 395)

# máscara do rosto (pele preenchida) para não apagar contorno do rosto ao encurtar o cabelo
_lower = ndi.binary_closing(skin_m & (yy > 326), iterations=3)
_upper = FACE_POLY & (yy < 340)
face_keep = ndi.binary_dilation(_lower | _upper, iterations=5)


def recolor(spec):
    out = src.copy()
    o = out[..., :3]
    # ---- cabelo: rampa de 3 pontos pelo brilho original (190 sombra, 233 meio, 255 brilho)
    if spec.get('hair'):
        c0, c1, c2 = [hexrgb(h) for h in spec['hair']]
        l = lum[hair_m]
        t = np.zeros((l.size, 3))
        lo = (l <= 190)
        mid = (l > 190) & (l <= 233)
        hi = l > 233
        w = np.clip((l - 150) / 40.0, 0, 1)[:, None]                      # 150..190: contorno -> sombra
        t[lo] = (OUTLINE * (1 - w) + c0 * w)[lo]
        w2 = ((l - 190) / 43.0).clip(0, 1)[:, None]
        t[mid] = (c0 * (1 - w2) + c1 * w2)[mid]
        w3 = ((l - 233) / 22.0).clip(0, 1)[:, None]
        t[hi] = (c1 * (1 - w3) + c2 * w3)[hi]
        o[hair_m] = t
    # ---- pele: multiplica pelo tom alvo (mantém sombras e blush)
    if spec.get('skin'):
        ratio = hexrgb(spec['skin']) / REF_SKIN
        o[skin_m] = np.clip(rgb[skin_m] * ratio, 0, 255)
    if spec.get('noblush'):
        o[blush_m] = hexrgb(spec['skin']) if spec.get('skin') else REF_SKIN
    # ---- olhos: troca de matiz / brilho da íris
    if spec.get('iris'):
        hdeg, sm, vm = spec['iris']
        px = rgb[iris_m] / 255.0
        res = []
        for r, g, b in px:
            h, s, v = colorsys.rgb_to_hsv(r, g, b)
            h = hdeg / 360.0
            res.append(colorsys.hsv_to_rgb(h, min(1, s * sm), min(1, v * vm)))
        o[iris_m] = np.array(res) * 255
    return out


def squeeze(out, k):
    # comprime o cabelo (x<118 e x>394) em direção ao rosto; o rosto fica intacto
    res = np.zeros_like(out)
    x_dst = np.arange(W)
    x_src = x_dst.astype(float)
    left = x_dst < 118
    right = x_dst > 394
    x_src[left] = 118 - (118 - x_dst[left]) / k
    x_src[right] = 394 + (x_dst[right] - 394) / k
    x_src = np.clip(np.round(x_src).astype(int), 0, W - 1)
    valid = np.ones(W, bool)
    valid[left] = (118 - (118 - x_dst[left]) / k) >= 0
    valid[right] = (394 + (x_dst[right] - 394) / k) <= W - 1
    res = out[:, x_src, :].copy()
    res[:, ~valid, 3] = 0
    return res


def trim_hair(out, line):
    """Corta o cabelo abaixo de uma linha (x_out,y_out)->(x_in,y_in) nos dois lados, fora do rosto."""
    (xo, yo), (xi, yi) = line
    # lado esquerdo: reta de (xo,yo) a (xi,yi); espelha para o direito em torno de x=256
    def y_cut(x):
        xl = np.where(x < 256, x, 512 - x)
        tt = np.clip((xl - xo) / float(xi - xo), 0, 1)
        return yo + tt * (yi - yo)
    ycut = y_cut(xx.astype(float))
    erase = (yy > ycut) & ~face_keep & (out[..., 3] > 0) & ~skin_m
    out[erase, 3] = 0
    # contorno ao longo do corte (só onde ainda há cabelo)
    edge = (yy > ycut - 2.2) & (yy <= ycut + 0.5) & ~face_keep & (out[..., 3] > 0)
    out[edge, :3] = OUTLINE
    out[edge, 3] = 255
    return out


SPECS = {
    # hair = (sombra, meio, brilho)
    'pai':        dict(hair=('#140d0a', '#33241d', '#7b5e4f'), skin='#e8b88b', iris=(24, 0.95, 0.45), noblush=True, squeeze=0.5, trim=((59, 296), (118, 352))),
    'mae':        dict(hair=('#3d1b10', '#6e3622', '#c98558'), skin='#ffdcb6', iris=None),
    'avo':        dict(hair=None, skin='#f1c9a2', iris=(26, 0.9, 0.42), noblush=True, squeeze=0.5, trim=((59, 296), (118, 356))),
    'irma':       dict(hair=('#4a1126', '#8a2447', '#ec8fb0'), skin='#fbd7b3', iris=None, squeeze=0.55, trim=((55, 300), (118, 350))),
    'professora': dict(hair=('#3b1409', '#74301b', '#d07a48'), skin='#c58c61', iris=(25, 0.95, 0.42), squeeze=0.55, trim=((55, 300), (118, 350))),
    'vizinho':    dict(hair=('#0b0807', '#211812', '#5a463a'), skin='#a8714b', iris=(24, 0.95, 0.42), noblush=True, squeeze=0.5, trim=((59, 296), (118, 352))),
    'seguranca':  dict(hair=('#0b0b10', '#1c1b23', '#55536a'), skin='#86573c', iris=(22, 0.9, 0.38), noblush=True, squeeze=0.5, trim=((59, 296), (118, 352))),
}

if __name__ == '__main__':
    for k, spec in SPECS.items():
        out = recolor(spec)
        if spec.get('squeeze'):
            out = squeeze(out, spec['squeeze'])
        if spec.get('trim'):
            out = trim_hair(out, spec['trim'])
        Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(os.path.join(BASE, f'{k}-base.png'), optimize=True)
        print('ok', k)
