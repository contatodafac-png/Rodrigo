# Recorta a personagem da imagem de referência (remove o fundo cinza por flood-fill a partir das bordas).
import sys, numpy as np
from PIL import Image
from scipy import ndimage as ndi
src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGBA'); a = np.array(im)
lum = a[..., :3].astype(int).mean(axis=2)
light = lum > 214                                  # fundo (245) e marca d'água clara
lab, n = ndi.label(light)
border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
bg = np.isin(lab, list(border))
char = ~bg
char = ndi.binary_fill_holes(char)                  # buracos internos continuam personagem
char = ndi.binary_erosion(char, iterations=2)       # tira o halo claro da borda
alpha = ndi.gaussian_filter(char.astype(float), 0.8)  # borda suavizada (sem serrilhado)
a[..., 3] = np.clip(alpha * 255 * 1.15, 0, 255).astype(np.uint8)
Image.fromarray(a).save(out)
print('ok', char.sum())
