const { INK, P, L, mirror, symPath, bodyShape } = require('./engine');

// ---------- ajudantes de cabelo
function shadedHair(uid, key, d, hair, dy = 14) {
  return `<clipPath id="${uid}${key}"><path d="${d}"/></clipPath>`
    + `<path d="${d}" fill="${hair.shade}"/>`
    + `<g clip-path="url(#${uid}${key})"><path d="${d}" transform="translate(0 -${dy})" fill="${hair.base}"/></g>`
    + P(d, 'none', 5);
}
const bez = (p0, p1, p2, p3, t) => {
  const u = 1 - t;
  return [0, 1].map((k) => u * u * u * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * p3[k]);
};
// brilhos do cabelo em arco (como na referência): losangos finos acompanhando a cúpula
function shine(hair, from, c1, c2, to, ts, inset = 26, center = [256, 240], len = 19, wid = 4.6) {
  let s = '';
  for (const t of ts) {
    const [x, y] = bez(from, c1, c2, to, t);
    const dx = center[0] - x, dy = center[1] - y, dist = Math.hypot(dx, dy) || 1;
    const px = x + (dx / dist) * inset, py = y + (dy / dist) * inset;
    const ang = (Math.atan2(y - center[1], x - center[0]) * 180) / Math.PI - 90;
    s += `<ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="${wid}" ry="${len}" transform="rotate(${ang.toFixed(1)} ${px.toFixed(1)} ${py.toFixed(1)})" fill="${hair.hi}" opacity="0.92"/>`;
  }
  return s;
}
const shineBoth = (hair, from, c1, c2, to, ts, inset, center, len, wid) =>
  shine(hair, from, c1, c2, to, ts, inset, center, len, wid) + mirror(shine(hair, from, c1, c2, to, ts, inset, center, len, wid));
const foreheadShadow = (uid, d, col, dy = 16) =>
  `<g clip-path="url(#${uid}face)"><path d="${d}" transform="translate(0 ${dy})" fill="${col}" opacity="0.75"/></g>`;

// camiseta/camisa em V visível dentro da gola
const vShirt = (nw, nl, tipY, col) =>
  `<path d="M${256 - nw} 520 C${256 - nw + 12} ${520 + nl} ${256 + nw - 12} ${520 + nl} ${256 + nw} 520 L256 ${tipY}Z" fill="${col}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`;
const button = (x, y, col = '#f4eee2') => `<circle cx="${x}" cy="${y}" r="6" fill="${col}" stroke="${INK}" stroke-width="3"/>`;

const chars = {};

// =================================================================== LIVY
const LIVY_HAIR = { base: '#4d2c93', shade: '#2d1760', hi: '#b8a2f5' };
chars.livy = {
  key: 'livy', nome: 'Livy', profile: 'child',
  skin: '#fbdcb4', skinShade: '#e8b98c', skinLine: '#cf9a6c',
  eyeCols: ['#b4420b', '#ff9b1d', '#ffe24d'], blush: '#ee8b8b', browColor: '#2a1650',
  parts(ctx) {
    const { uid } = ctx, H = LIVY_HAIR;
    const backD = symPath([256, 54], [
      ['C', 164, 54, 90, 118, 88, 228],
      ['C', 90, 300, 82, 380, 62, 442],
      ['L', 108, 424], ['L', 92, 476], ['L', 142, 434], ['L', 138, 480], ['L', 186, 436], ['L', 256, 424]]);
    const capD = symPath([256, 50], [
      ['C', 172, 50, 102, 114, 104, 228],
      ['C', 102, 292, 98, 352, 104, 420],
      ['C', 126, 394, 148, 330, 156, 264],
      ['L', 176, 224], ['L', 192, 258], ['L', 216, 226], ['L', 234, 264], ['L', 244, 236], ['L', 256, 306]]);
    const back = P(backD, H.shade, 5);
    const preNeck = `<ellipse cx="256" cy="512" rx="86" ry="32" fill="#1f1240" stroke="${INK}" stroke-width="5"/>`;
    const hood = '#33205f';
    const strings = `${L('M226 560 C222 584 228 604 222 626', 9, INK)}${L('M226 560 C222 584 228 604 222 626', 4.5, '#efe8ff')}`
      + `${L('M286 560 C290 584 284 604 290 626', 9, INK)}${L('M286 560 C290 584 284 604 290 626', 4.5, '#efe8ff')}`
      + `<ellipse cx="222" cy="629" rx="5" ry="7" fill="#efe8ff" stroke="${INK}" stroke-width="3"/><ellipse cx="290" cy="629" rx="5" ry="7" fill="#efe8ff" stroke="${INK}" stroke-width="3"/>`;
    const folds = L('M92 618 Q120 590 150 604 M420 618 Q392 590 362 604', 3, '#1d0f3e', 'opacity="0.7"');
    // fone de ouvido creme com detalhe verde-menta, apoiado nos ombros (faixa passa atrás do pescoço)
    const band = () => { const d = 'M150 552 C150 520 172 496 206 502'; return `${L(d, 17, INK)}${L(d, 10, '#f4eee2')}`; };
    const cup = (cx, cy, rot) => `<g transform="translate(${cx} ${cy}) rotate(${rot})">`
      + `<rect x="-31" y="-44" width="62" height="88" rx="27" fill="#f4eee2" stroke="${INK}" stroke-width="5"/>`
      + `<rect x="-20" y="-32" width="40" height="64" rx="18" fill="#2b1a55" stroke="${INK}" stroke-width="3"/>`
      + `<rect x="-14" y="-26" width="28" height="52" rx="13" fill="#3de0c2"/>`
      + `<rect x="-8" y="-19" width="6" height="20" rx="3" fill="#fff" opacity="0.85"/></g>`;
    const body = bodyShape(ctx, { fill: hood, nw: 54, nl: 24, extra: folds }) + band() + mirror(band());
    const collar = `<path d="M202 520 C214 552 298 552 310 520" fill="none" stroke="${INK}" stroke-width="22" stroke-linecap="round"/>`
      + `<path d="M202 520 C214 552 298 552 310 520" fill="none" stroke="#1f1240" stroke-width="13" stroke-linecap="round"/>`;
    const bodyFront = collar + strings + cup(138, 572, -12) + cup(374, 572, 12);
    const faceDecor = foreheadShadow(uid, capD, '#e8b98c', 18);
    const front = shadedHair(uid, 'cap', capD, H, 16)
      + shineBoth(H, [256, 50], [172, 50], [102, 114], [104, 228], [0.2, 0.32, 0.44, 0.56, 0.68], 26);
    return { back, preNeck, body, bodyFront, faceDecor, front };
  },
};

// =================================================================== PAI
const PAI_HAIR = { base: '#2b1b14', shade: '#140b08', hi: '#7a5646' };
chars.pai = {
  key: 'pai', nome: 'Pai', profile: 'adult',
  skin: '#e5b487', skinShade: '#c68f62', skinLine: '#b07a50',
  eyeCols: ['#2f1707', '#6e3a14', '#bf8445'], blush: null, browColor: '#1c120d', browW: 7.5,
  parts(ctx) {
    const { uid } = ctx, H = PAI_HAIR;
    const capD = symPath([256, 72], [
      ['C', 184, 72, 130, 114, 136, 206],
      ['L', 142, 246], ['L', 164, 214],
      ['C', 186, 198, 224, 186, 256, 202]]);
    const body = bodyShape(ctx, { fill: '#e2a21f', nw: 58, nl: 22 })
      + `<path d="M196 518 L240 570 L214 582 L184 540Z" fill="#f2b93e" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>`
      + mirror(`<path d="M196 518 L240 570 L214 582 L184 540Z" fill="#f2b93e" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>`)
      + L('M256 560 L256 640', 4) + button(256, 596, '#fff4d6') + button(256, 622, '#fff4d6');
    const beard = `<g clip-path="url(#${uid}face)"><path d="M148 352 C152 410 198 418 256 418 C314 418 360 410 364 352 L364 500 L148 500Z" fill="#2b1b14" opacity="0.2"/></g>`;
    const front = foreheadShadow(uid, capD, '#c68f62', 14)
      + shadedHair(uid, 'cap', capD, H, 14)
      + shineBoth(H, [256, 72], [184, 72], [130, 114], [136, 206], [0.25, 0.4, 0.55, 0.7], 22, [256, 240], 15, 4)
      + L('M232 100 C224 130 236 168 258 196', 3.5, '#140b08');
    return { body, beard, front };
  },
};

// =================================================================== MÃE
const MAE_HAIR = { base: '#6a3320', shade: '#3d1b10', hi: '#d38c5c' };
chars.mae = {
  key: 'mae', nome: 'Mãe', profile: 'adult',
  skin: '#f6d3ad', skinShade: '#e1b48a', skinLine: '#c99872',
  eyeCols: ['#b4420b', '#ff9b1d', '#ffe24d'], blush: '#f19a9a', browColor: '#3d1b10',
  pOver: { rx: 27, ry: 30 },
  parts(ctx) {
    const { uid } = ctx, H = MAE_HAIR;
    const backD = symPath([256, 62], [
      ['C', 168, 62, 100, 126, 100, 236],
      ['C', 100, 340, 80, 460, 88, 590],
      ['L', 256, 610]]);
    const capD = symPath([256, 70], [
      ['C', 178, 70, 116, 124, 116, 226],
      ['C', 114, 310, 96, 420, 98, 572],
      ['C', 128, 556, 150, 440, 160, 336],
      ['C', 164, 290, 174, 270, 184, 252],
      ['C', 196, 226, 232, 178, 256, 158]]);
    const back = P(backD, H.shade, 5);
    const body = bodyShape(ctx, { fill: '#e8776c', nw: 60, nl: 36 })
      + `<path d="M206 526 C226 586 286 586 306 526" fill="none" stroke="#ffd24d" stroke-width="3.5" stroke-linecap="round"/>`
      + `<circle cx="256" cy="578" r="6.5" fill="#ffd24d" stroke="${INK}" stroke-width="3"/>`;
    const front = foreheadShadow(uid, capD, '#e1b48a', 14)
      + shadedHair(uid, 'cap', capD, H, 16)
      + shineBoth(H, [256, 70], [178, 70], [116, 124], [116, 226], [0.22, 0.36, 0.5, 0.64], 24)
      + L('M138 330 C132 400 128 480 130 552 M154 350 C150 410 146 470 148 520', 3, H.shade, 'opacity="0.85"')
      + mirror(L('M138 330 C132 400 128 480 130 552 M154 350 C150 410 146 470 148 520', 3, H.shade, 'opacity="0.85"'));
    return { back, body, front };
  },
};

// =================================================================== AVÔ
const AVO_HAIR = { base: '#f1f2f6', shade: '#bcc1cf', hi: '#ffffff' };
chars.avo = {
  key: 'avo', nome: 'Avô', profile: 'elder',
  skin: '#efc9a2', skinShade: '#d6a67b', skinLine: '#c08c62',
  eyeCols: ['#2a1608', '#5a3418', '#a8743c'], blush: '#f0a0a0', browColor: '#9aa1b3', browW: 9,
  pOver: { my: 430, ny: 384 },
  parts(ctx) {
    const { uid, p, exL, exR, ey } = ctx, H = AVO_HAIR;
    const tuft = `M152 186 Q130 198 132 230 Q118 248 132 266 Q126 288 146 304 Q158 288 162 264 Q174 232 170 206 Q166 190 152 186Z`;
    const body = bodyShape(ctx, { fill: '#5f7d4e', nw: 62, nl: 34, extra: vShirt(62, 34, 612, '#f3f1ea') + L('M256 612 L256 640', 4) + button(256, 622, '#e9e2c9') })
      ;
    const faceDecor = [
      L('M196 168 Q256 156 316 168 M206 186 Q256 177 306 186', 2.8, '#c08c62'),
      L(`M${exL - 36} ${ey - 10} l-13 -6 M${exL - 36} ${ey + 2} l-15 2 M${exL - 34} ${ey + 14} l-12 8`, 2.6, '#b88458'),
      mirror(L(`M${exL - 36} ${ey - 10} l-13 -6 M${exL - 36} ${ey + 2} l-15 2 M${exL - 34} ${ey + 14} l-12 8`, 2.6, '#b88458')),
      L('M200 396 Q190 424 204 448', 2.8, '#c08c62'), L('M312 396 Q322 424 308 448', 2.8, '#c08c62'),
      `<ellipse cx="226" cy="146" rx="26" ry="10" transform="rotate(-24 226 146)" fill="#fff" opacity="0.75"/>`,
      L('M254 114 q4 -14 12 -16 M262 114 q6 -10 14 -10', 3, '#b9bec9'),
    ].join('');
    const mustD = symPath([256, 400], [
      ['C', 238, 392, 214, 394, 194, 408],
      ['C', 184, 420, 198, 428, 212, 420],
      ['C', 228, 413, 242, 414, 256, 416]]);
    const mustache = P(mustD, '#f4f4f8', 4.5) + L('M214 404 Q232 404 244 410 M298 404 Q280 404 268 410', 2.2, '#bcc1cf');
    const glass = (cx) => `<circle cx="${cx}" cy="${ey}" r="41" fill="#cfe9ff" opacity="0.2"/>`
      + `<circle cx="${cx}" cy="${ey}" r="41" fill="none" stroke="${INK}" stroke-width="9"/><circle cx="${cx}" cy="${ey}" r="41" fill="none" stroke="#7a5a3a" stroke-width="4.5"/>`
      + L(`M${cx - 22} ${ey - 24} l12 -6 M${cx - 28} ${ey - 12} l6 -3`, 3, '#fff', 'opacity="0.9"');
    const eyewear = glass(exL) + glass(exR)
      + L(`M${exL + 41} ${ey - 6} Q256 ${ey - 20} ${exR - 41} ${ey - 6}`, 8, INK) + L(`M${exL + 41} ${ey - 6} Q256 ${ey - 20} ${exR - 41} ${ey - 6}`, 4, '#7a5a3a')
      + L(`M${exL - 41} ${ey - 4} L146 ${ey - 8}`, 8, INK) + L(`M${exL - 41} ${ey - 4} L146 ${ey - 8}`, 4, '#7a5a3a')
      + L(`M${exR + 41} ${ey - 4} L366 ${ey - 8}`, 8, INK) + L(`M${exR + 41} ${ey - 4} L366 ${ey - 8}`, 4, '#7a5a3a');
    const front = P(tuft, H.base, 5) + mirror(P(tuft, H.base, 5))
      + L('M140 220 Q136 250 144 280 M158 214 Q160 244 154 270', 2.6, H.shade)
      + mirror(L('M140 220 Q136 250 144 280 M158 214 Q160 244 154 270', 2.6, H.shade));
    return { body, faceDecor, mustache, eyewear, front };
  },
};

// =================================================================== IRMÃ ADULTA
const IRMA_HAIR = { base: '#7c1f3f', shade: '#4a1126', hi: '#e98aa8' };
chars.irma = {
  key: 'irma', nome: 'Irmã', profile: 'adult',
  skin: '#f4cfa6', skinShade: '#deb084', skinLine: '#c8966c',
  eyeCols: ['#b4420b', '#ff9b1d', '#ffe24d'], blush: '#f08e8e', browColor: '#4a1126',
  pOver: { rx: 29, ry: 33, dx: 61, ey: 334 },
  parts(ctx) {
    const { uid } = ctx, H = IRMA_HAIR;
    const ponyD = 'M334 96 C422 74 474 150 466 244 C462 326 440 388 418 446 C402 414 414 354 404 302 C396 238 368 172 322 140Z';
    const back = shadedHair(uid, 'pony', ponyD, H, 0).replace(`<path d="${ponyD}" fill="${H.shade}"/>`, `<path d="${ponyD}" fill="${H.shade}"/>`)
      + L('M420 150 C446 220 440 300 424 380 M394 160 C420 226 416 300 410 340', 3, H.hi, 'opacity="0.55"');
    const capD = symPath([256, 62], [
      ['C', 178, 62, 118, 118, 120, 214],
      ['C', 120, 270, 118, 310, 126, 352],
      ['C', 142, 326, 152, 292, 158, 252],
      ['L', 178, 214], ['L', 196, 248], ['L', 222, 208], ['L', 238, 244], ['L', 256, 284]]);
    const jacket = '#4f7fb5';
    const body = bodyShape(ctx, { fill: jacket, nw: 62, nl: 30, extra: vShirt(62, 30, 596, '#fafafa') + L('M256 596 L256 640', 4, INK) + L('M120 600 L120 640 M392 600 L392 640', 3, '#9ec2ea', 'stroke-dasharray="7 6"') + L('M196 524 C150 540 110 580 100 610', 3, '#9ec2ea', 'stroke-dasharray="7 6"') + L('M316 524 C362 540 402 580 412 610', 3, '#9ec2ea', 'stroke-dasharray="7 6"') });
    const hoop = (x) => `<circle cx="${x}" cy="384" r="14" fill="none" stroke="${INK}" stroke-width="7"/><circle cx="${x}" cy="384" r="14" fill="none" stroke="#ffd24d" stroke-width="3.4"/>`;
    const scrunchie = `<ellipse cx="348" cy="118" rx="14" ry="22" transform="rotate(32 348 118)" fill="#ffd23a" stroke="${INK}" stroke-width="4.5"/>`;
    const front = foreheadShadow(uid, capD, '#deb084', 14)
      + shadedHair(uid, 'cap', capD, H, 14)
      + shineBoth(H, [256, 62], [178, 62], [118, 118], [120, 214], [0.22, 0.36, 0.5, 0.64], 24, [256, 240], 17, 4.4)
      + scrunchie + hoop(150) + hoop(362);
    return { back, body, front };
  },
};

// =================================================================== PROFESSORA
const PROF_HAIR = { base: '#6a2c19', shade: '#3b1409', hi: '#c9703f' };
chars.professora = {
  key: 'professora', nome: 'Professora', profile: 'adult',
  skin: '#b97f55', skinShade: '#9a6338', skinLine: '#7d4b27',
  eyeCols: ['#2a1608', '#5a3418', '#b07a3c'], blush: '#e07a72', browColor: '#2b0f06', browW: 6.5,
  pOver: { rx: 26, ry: 29 },
  parts(ctx) {
    const { uid, exL, exR, ey } = ctx, H = PROF_HAIR;
    const bun = `<ellipse cx="256" cy="58" rx="48" ry="40" fill="${H.shade}" stroke="${INK}" stroke-width="5"/>`
      + `<ellipse cx="256" cy="54" rx="40" ry="32" fill="${H.base}"/>`
      + L('M226 58 Q256 34 288 58 M234 72 Q256 56 280 72', 3, H.shade)
      + `<rect x="212" y="84" width="88" height="14" rx="7" fill="#f2c94c" stroke="${INK}" stroke-width="4"/>`;
    const capD = symPath([256, 76], [
      ['C', 186, 76, 128, 122, 130, 216],
      ['C', 130, 238, 136, 254, 150, 266],
      ['L', 166, 224],
      ['C', 186, 202, 226, 190, 256, 192]]);
    const lapel = '<path d="M196 518 L242 606 L256 566 L220 522Z" fill="#236163" stroke="#15101d" stroke-width="4.5" stroke-linejoin="round"/>';
    const pearls = [0, 1, 2, 3, 4, 5, 6].map((i) => {
      const t = i / 6, x = 206 + t * 100, y = 524 + Math.sin(t * Math.PI) * 44;
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5" fill="#fff" stroke="${INK}" stroke-width="2.6"/>`;
    }).join('');
    const body = bodyShape(ctx, { fill: '#2c7a7b', nw: 60, nl: 34, extra: vShirt(60, 34, 612, '#fafafa') + pearls + lapel + mirror(lapel) })
      ;
    const rect = (cx) => `<rect x="${cx - 43}" y="${ey - 31}" width="86" height="62" rx="20" fill="#cfe9ff" opacity="0.18"/>`
      + `<rect x="${cx - 43}" y="${ey - 31}" width="86" height="62" rx="20" fill="none" stroke="${INK}" stroke-width="9"/><rect x="${cx - 43}" y="${ey - 31}" width="86" height="62" rx="20" fill="none" stroke="#1f9a9a" stroke-width="4.5"/>`
      + L(`M${cx - 26} ${ey - 20} l14 -4`, 3, '#fff', 'opacity="0.9"');
    const bridge = L(`M${exL + 43} ${ey - 8} Q256 ${ey - 18} ${exR - 43} ${ey - 8}`, 8, INK) + L(`M${exL + 43} ${ey - 8} Q256 ${ey - 18} ${exR - 43} ${ey - 8}`, 4, '#1f9a9a');
    const arms = L(`M${exL - 43} ${ey - 6} L148 ${ey - 10}`, 8, INK) + L(`M${exL - 43} ${ey - 6} L148 ${ey - 10}`, 4, '#1f9a9a')
      + L(`M${exR + 43} ${ey - 6} L364 ${ey - 10}`, 8, INK) + L(`M${exR + 43} ${ey - 6} L364 ${ey - 10}`, 4, '#1f9a9a');
    const eyewear = rect(exL) + rect(exR) + bridge + arms;
    const front = foreheadShadow(uid, capD, '#9a6338', 14)
      + shadedHair(uid, 'cap', capD, H, 14)
      + shineBoth(H, [256, 76], [186, 76], [128, 122], [130, 216], [0.28, 0.44, 0.6], 22, [256, 240], 15, 4);
    return { back: bun, body, eyewear, front };
  },
};

// =================================================================== VIZINHO
const VIZ_HAIR = { base: '#1c1511', shade: '#0b0807', hi: '#4a3a30' };
chars.vizinho = {
  key: 'vizinho', nome: 'Vizinho', profile: 'adult',
  skin: '#a06844', skinShade: '#7f4d2c', skinLine: '#613819',
  eyeCols: ['#25130a', '#5a3216', '#a8703a'], blush: null, browColor: '#150e0a', browW: 8, mouthInk: '#f3c9b4',
  pOver: { my: 428, ny: 392, rx: 26, ry: 28 },
  parts(ctx) {
    const { uid } = ctx;
    const flowers = [[96, 640, '#fff'], [150, 588, '#ffe45e'], [60, 600, '#7df5da'], [112, 612, '#ff7b9c'], [196, 600, '#fff'], [220, 628, '#ffe45e'],
      [316, 600, '#7df5da'], [292, 630, '#fff'], [350, 590, '#ff7b9c'], [398, 612, '#ffe45e'], [440, 600, '#fff'], [380, 636, '#7df5da'], [172, 560, '#ffe45e'], [338, 556, '#fff']]
      .map(([x, y, col]) => `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-9" rx="5.5" ry="8" transform="rotate(${a})" fill="${col}" stroke="${INK}" stroke-width="2.2"/>`).join('')}<circle r="4" fill="#f08a24" stroke="${INK}" stroke-width="2"/></g>`).join('');
    const flap = '<path d="M194 516 L242 572 L214 590 L180 540Z" fill="#f7a84a" stroke="#15101d" stroke-width="4.5" stroke-linejoin="round"/>';
    const body = bodyShape(ctx, { fill: '#e8761e', nw: 62, nl: 28, extra: flowers + vShirt(62, 28, 584, '#f3f1ea') + flap + mirror(flap) });
    const beardD = 'M147 350 C148 440 194 498 256 504 C318 498 364 440 365 350 C348 372 332 390 312 396 C296 388 272 396 256 396 C240 396 216 388 200 396 C180 390 164 372 147 350Z';
    const beard = `<g>${P(beardD, VIZ_HAIR.base, 5)}${L('M190 450 Q210 470 232 478 M322 450 Q302 470 280 478', 2.6, VIZ_HAIR.hi, 'opacity="0.6"')}</g>`;
    const mustD = symPath([256, 398], [
      ['C', 236, 390, 212, 390, 192, 404],
      ['C', 184, 414, 196, 422, 208, 418],
      ['C', 226, 411, 242, 410, 256, 412]]);
    const mustache = P(mustD, VIZ_HAIR.base, 4.5) + L('M206 402 Q226 400 244 406 M306 402 Q286 400 268 406', 2.2, VIZ_HAIR.hi, 'opacity="0.55"');
    const crown = 'M126 210 C124 110 186 58 256 58 C326 58 388 110 386 210 C340 230 172 230 126 210Z';
    const brim = 'M112 206 C186 238 326 238 400 206 C394 242 334 270 256 270 C178 270 118 242 112 206Z';
    const front = `<clipPath id="${uid}crown"><path d="${crown}"/></clipPath>`
      + `<path d="${crown}" fill="#c93a32" stroke="${INK}" stroke-width="5"/>`
      + `<g clip-path="url(#${uid}crown)"><path d="M330 40 L420 40 L420 240 L320 240Z" fill="#7d1713" opacity="0.35"/></g>`
      + L('M256 62 L256 214 M200 74 Q184 140 190 218 M312 74 Q328 140 322 218', 2.6, '#7d1713')
      + `<circle cx="256" cy="62" r="8" fill="#7d1713" stroke="${INK}" stroke-width="3.5"/>`
      + `<path d="${brim}" fill="#9d2620" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`
      + `<path d="M150 214 Q256 252 362 214" fill="none" stroke="#c93a32" stroke-width="5" stroke-linecap="round" opacity="0.8"/>`
      + `<rect x="226" y="120" width="60" height="46" rx="14" fill="#ffe45e" stroke="${INK}" stroke-width="4"/>`
      + `<path d="M240 150 Q256 126 272 150 M244 144 L268 144" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`;
    return { body, beard, mustache, front };
  },
};

// =================================================================== SEGURANÇA
const SEG_HAIR = { base: '#1a1920', shade: '#0b0b10', hi: '#4a4960' };
chars.seguranca = {
  key: 'seguranca', nome: 'Segurança', profile: 'square',
  skin: '#84543a', skinShade: '#653d27', skinLine: '#4c2c18',
  eyeCols: ['#1a0d06', '#4d2a12', '#9a6630'], blush: null, browColor: '#0f0b0a', browW: 9,
  parts(ctx) {
    const { uid } = ctx, H = SEG_HAIR;
    const capD = symPath([256, 96], [
      ['C', 190, 96, 146, 136, 146, 214],
      ['L', 150, 246], ['L', 166, 208],
      ['C', 190, 188, 226, 184, 256, 188]]);
    const patch = (x) => `<rect x="${x}" y="566" width="64" height="26" rx="6" fill="#0f1a33" stroke="${INK}" stroke-width="4" transform="rotate(${x < 256 ? -20 : 20} ${x + 32} 579)"/>`
      + `<path d="M${x + 14} 580 l${x < 256 ? -0 : 0} 0" />`;
    const body = bodyShape(ctx, { fill: '#223a6e', nw: 68, nl: 34, extra: vShirt(68, 34, 596, '#f3f1ea') + `<path d="M256 546 L270 570 L256 640 L242 570Z" fill="#15151f" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>` + `<path d="M242 538 L270 538 L262 552 L250 552Z" fill="#15151f" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>` })
      + patch(48) + patch(400)
      + `<path d="M340 580 L372 588 L368 618 L356 628 L344 618 Z" fill="#ffd24d" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>`
      + `<path d="M356 596 l4 9 l9 1 l-7 6 l2 9 l-8 -5 l-8 5 l2 -9 l-7 -6 l9 -1z" fill="#fff4b8" stroke="${INK}" stroke-width="2"/>`;
    const earpiece = L('M366 352 C396 400 392 470 340 524', 8, INK) + L('M366 352 C396 400 392 470 340 524', 3.2, '#e2e2f0', 'stroke-dasharray="1 6"')
      + `<rect x="358" y="326" width="16" height="34" rx="8" fill="#15151f" stroke="${INK}" stroke-width="3.5"/>`;
    const front = foreheadShadow(uid, capD, '#653d27', 12)
      + shadedHair(uid, 'cap', capD, H, 12)
      + shineBoth(H, [256, 96], [190, 96], [146, 136], [146, 214], [0.3, 0.5, 0.7], 20, [256, 240], 13, 4);
    return { body, front, over: earpiece };
  },
};

module.exports = { chars, shadedHair, shine, foreheadShadow, bez };
