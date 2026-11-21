// Motor de avatares — estilo anime 2D (contorno grosso, cel-shading chapado,
// olhos grandes com brilho, blush em hachura). Tudo em SVG, viewBox 512x640.
const INK = '#15101d';

const P = (d, fill, sw = 5, extra = '') =>
  `<path d="${d}" fill="${fill}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
const L = (d, sw = 4, color = INK, extra = '') =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
const mirror = (s) => `<g transform="translate(512 0) scale(-1 1)">${s}</g>`;
const n1 = (x) => Math.round(x * 10) / 10;

// Caminho simétrico: descreve só a metade esquerda, espelha o resto.
function symPath(start, segs) {
  const pts = [start];
  let d = `M${start[0]} ${start[1]}`;
  for (const s of segs) {
    if (s[0] === 'L') { d += ` L${s[1]} ${s[2]}`; pts.push([s[1], s[2]]); }
    else { d += ` C${s.slice(1, 7).join(' ')}`; pts.push([s[5], s[6]]); }
  }
  const mx = (x) => 512 - x;
  for (let i = segs.length - 1; i >= 0; i--) {
    const s = segs[i], prev = pts[i];
    if (s[0] === 'L') d += ` L${mx(prev[0])} ${prev[1]}`;
    else d += ` C${mx(s[3])} ${s[4]} ${mx(s[1])} ${s[2]} ${mx(prev[0])} ${prev[1]}`;
  }
  return d + ' Z';
}

// ---------------------------------------------------------------- rostos
const FACES = {
  child: symPath([256, 124], [
    ['C', 196, 124, 146, 160, 143, 232],
    ['C', 141, 330, 176, 440, 214, 458],
    ['C', 232, 466, 244, 467, 256, 467]]),
  adult: symPath([256, 116], [
    ['C', 196, 116, 152, 150, 150, 222],
    ['C', 148, 330, 176, 440, 222, 478],
    ['C', 238, 488, 246, 489, 256, 489]]),
  square: symPath([256, 116], [
    ['C', 190, 116, 148, 150, 146, 222],
    ['C', 146, 330, 148, 420, 170, 456],
    ['C', 190, 486, 226, 495, 256, 495]]),
};
const PROFILES = {
  //        olhos: rx ry  centro-y  dx   boca-y  nariz-y  pescoço  ombro-x
  child:  { rx: 34, ry: 38, ey: 336, dx: 60, my: 419, ny: 389, neck: 44, xl: 52, mscale: 1.0, ear: false, dy: 34 },
  adult:  { rx: 25, ry: 27, ey: 332, dx: 58, my: 418, ny: 388, neck: 50, xl: 34, mscale: 0.92, ear: true, dy: 26 },
  elder:  { rx: 21, ry: 23, ey: 334, dx: 56, my: 420, ny: 390, neck: 50, xl: 40, mscale: 0.9, ear: true, dy: 26 },
  square: { rx: 24, ry: 26, ey: 332, dx: 60, my: 424, ny: 392, neck: 62, xl: 10, mscale: 1.0, ear: true, dy: 22 },
};

// ---------------------------------------------------------------- olhos
function eyeSVG(uid, side, p, c, o) {
  const rx = p.rx, ry = p.ry * (o.ryScale || 1);
  const cut = o.cut ? [o.cut[0] * ry, o.cut[1] * ry] : null;
  const id = `${uid}${side}`;
  const irx = rx * 0.82 * (o.iris || 1), iry = ry * 0.98 * (o.iris || 1);
  const ix = o.look ? o.look[0] : 0, iy = (o.look ? o.look[1] : 0) + 2;
  const pr = (o.pupil || 1);
  let s = `<clipPath id="${id}el"><ellipse cx="0" cy="0" rx="${rx}" ry="${ry}"/></clipPath>`;
  s += `<clipPath id="${id}el2"><ellipse cx="0" cy="0" rx="${rx + 3}" ry="${ry + 3}"/></clipPath>`;
  if (cut) s += `<clipPath id="${id}vis"><polygon points="${-rx - 10},${cut[0]} ${rx + 10},${cut[1]} ${rx + 10},${ry + 12} ${-rx - 10},${ry + 12}"/></clipPath>`;
  s += `<g clip-path="url(#${id}el)">`;
  s += `<rect x="${-rx - 4}" y="${-ry - 4}" width="${2 * rx + 8}" height="${2 * ry + 8}" fill="#fff"/>`;
  s += `<g transform="translate(${ix} ${iy})">`;
  s += `<ellipse cx="0" cy="0" rx="${irx}" ry="${iry}" fill="url(#${uid}ig)" stroke="${INK}" stroke-width="2.5"/>`;
  s += `<ellipse cx="0" cy="${iry * 0.05}" rx="${irx * 0.5 * pr}" ry="${iry * 0.58 * pr}" fill="#2a1005"/>`;
  s += `<circle cx="${-irx * 0.3}" cy="${-iry * 0.38}" r="${Math.max(6, irx * 0.27)}" fill="#fff"/>`;
  s += `<circle cx="${irx * 0.34}" cy="${iry * 0.45}" r="${Math.max(3, irx * 0.13)}" fill="#fff"/>`;
  if (o.sparkle) s += `<circle cx="${irx * 0.5}" cy="${-iry * 0.2}" r="${Math.max(2, irx * 0.08)}" fill="#fff"/>`;
  s += `</g>`;
  s += `<ellipse cx="0" cy="${-ry + 4}" rx="${rx}" ry="${ry * 0.3}" fill="#1b0b2e" opacity="0.28"/>`;
  if (o.wet) s += `<ellipse cx="0" cy="${ry * 0.7}" rx="${rx * 0.75}" ry="${ry * 0.2}" fill="#bfe9ff" opacity="0.32"/>`;
  if (cut) s += `<polygon points="${-rx - 10},${-ry - 14} ${rx + 10},${-ry - 14} ${rx + 10},${cut[1]} ${-rx - 10},${cut[0]}" fill="${c.skin}"/>`;
  s += `</g>`;
  // contorno fino inferior / completo
  s += cut ? `<g clip-path="url(#${id}vis)">` : '<g>';
  s += `<ellipse cx="0" cy="0" rx="${rx}" ry="${ry}" fill="none" stroke="${INK}" stroke-width="2.6"/></g>`;
  // pálpebra superior grossa
  if (cut) {
    s += `<g clip-path="url(#${id}el2)">${L(`M${-rx - 6} ${cut[0] - (cut[1] - cut[0]) * 6 / (2 * rx)} L${rx + 6} ${cut[1] + (cut[1] - cut[0]) * 6 / (2 * rx)}`, 8)}</g>`;
    s += L(`M${-rx + 1} ${cut[0] + 1} Q${-rx - 6} ${cut[0] - 1} ${-rx - 9} ${cut[0] + 6}`, 5);
  } else {
    s += L(`M${-rx - 1} 3 A${rx + 1} ${ry + 1} 0 0 1 ${rx + 1} 3`, 7.5);
    s += L(`M${-rx - 1} 3 Q${-rx - 6} 2 ${-rx - 9} 8`, 5);
  }
  if (o.tear) {
    s += `<path d="M${-rx * 0.35} ${ry - 2} C${-rx * 0.8} ${ry + 16} ${-rx * 0.8} ${ry + 38} ${-rx * 0.35} ${ry + 40} C${rx * 0.1} ${ry + 38} ${rx * 0.1} ${ry + 16} ${-rx * 0.35} ${ry - 2}Z" fill="#a8e0ff" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>`;
    s += `<ellipse cx="${-rx * 0.45}" cy="${ry + 28}" rx="2.6" ry="5" fill="#fff"/>`;
  }
  return s;
}

// ---------------------------------------------------------------- expressões
// cut = [y no canto externo, y no canto interno] como fração de ry (-1 topo, +1 base)
const EXPR = {
  feliz: (p) => ({
    eyeL: { sparkle: true }, eyeR: { sparkle: true },
    browL: `M${-p.rx} ${-p.ry - 12} Q${-p.rx * 0.1} ${-p.ry - 26} ${p.rx * 0.9} ${-p.ry - 16}`,
    mouth: 'open', blush: 1, sym: 'sparkles',
  }),
  sorriso: (p) => ({
    eyeL: {}, eyeR: {},
    browL: `M${-p.rx} ${-p.ry - 12} Q${-p.rx * 0.1} ${-p.ry - 22} ${p.rx * 0.9} ${-p.ry - 15}`,
    mouth: 'smile', blush: 1,
  }),
  neutro: (p) => ({
    eyeL: {}, eyeR: {},
    browL: `M${-p.rx} ${-p.ry - 14} Q0 ${-p.ry - 18} ${p.rx * 0.9} ${-p.ry - 15}`,
    mouth: 'flat', blush: 0.6,
  }),
  triste: (p) => ({
    eyeL: { cut: [-0.42, -0.95], pupil: 1.18, iris: 1.02, wet: true, tear: true },
    eyeR: { cut: [-0.42, -0.95], pupil: 1.18, iris: 1.02, wet: true },
    browL: `M${-p.rx} ${-p.ry - 8} Q0 ${-p.ry - 16} ${p.rx * 0.9} ${-p.ry - 36}`,
    mouth: 'wobble', blush: 0.45, sym: 'gloom',
  }),
  surpreso: (p) => ({
    eyeL: { ryScale: 1.12, iris: 0.66, pupil: 0.62, sparkle: true },
    eyeR: { ryScale: 1.12, iris: 0.66, pupil: 0.62, sparkle: true },
    browL: `M${-p.rx} ${-p.ry - 26} Q0 ${-p.ry - 42} ${p.rx * 0.9} ${-p.ry - 28}`,
    mouth: 'o', blush: 1, sym: 'shock',
  }),
  confuso: (p) => ({
    eyeL: { look: [-7, -4], iris: 0.95 },
    eyeR: { ryScale: 0.86, cut: [-0.5, -0.2], look: [-7, -4], iris: 0.95 },
    browL: `M${-p.rx} ${-p.ry - 22} Q0 ${-p.ry - 40} ${p.rx * 0.9} ${-p.ry - 26}`,
    browR: `M${-p.rx} ${-p.ry - 12} L${p.rx * 0.9} ${-p.ry - 4}`,
    mouth: 'wave', blush: 0.7, sym: 'question',
  }),
  bravo: (p) => ({
    eyeL: { cut: [-0.5, 0.02], iris: 0.9, pupil: 0.78 },
    eyeR: { cut: [-0.5, 0.02], iris: 0.9, pupil: 0.78 },
    browL: `M${-p.rx - 4} ${-p.ry - 18} L${p.rx * 0.9} ${-p.ry * 0.55}`,
    mouth: 'grit', blush: 1.4, sym: 'anger',
  }),
};

function mouthSVG(kind, ms, lc = INK) {
  const L = (d, sw) => `<path d="${d}" fill="none" stroke="${lc}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`;
  let s = '';
  switch (kind) {
    case 'open':
      s += `<clipPath id="MOUTHCLIP"><path d="M-38 -4 Q0 12 38 -4 Q34 30 0 32 Q-34 30 -38 -4Z"/></clipPath>`;
      s += P('M-38 -4 Q0 12 38 -4 Q34 30 0 32 Q-34 30 -38 -4Z', '#8b2332', 4.5);
      s += `<g clip-path="url(#MOUTHCLIP)"><ellipse cx="0" cy="26" rx="17" ry="9" fill="#f2707f"/><path d="M-40 -6 L40 -6 L40 3 Q0 17 -40 3Z" fill="#fff"/></g>`;
      s += L('M-38 -4 Q0 12 38 -4 Q34 30 0 32 Q-34 30 -38 -4Z', 4.5);
      break;
    case 'smile':
      s += L('M-26 0 Q0 17 26 0', 4.5) + L('M-29 -3 L-24 3 M29 -3 L24 3', 3);
      break;
    case 'flat':
      s += L('M-15 4 Q0 8 15 4', 4.5);
      break;
    case 'wobble':
      s += L('M-22 12 Q-11 -2 0 8 Q11 -2 22 12', 4.5);
      break;
    case 'o':
      s += `<clipPath id="MOUTHCLIP"><ellipse cx="0" cy="8" rx="13" ry="19"/></clipPath>`;
      s += `<ellipse cx="0" cy="8" rx="13" ry="19" fill="#7a1f2b"/><g clip-path="url(#MOUTHCLIP)"><ellipse cx="0" cy="22" rx="9" ry="6" fill="#f2707f"/></g>`;
      s += `<ellipse cx="0" cy="8" rx="13" ry="19" fill="none" stroke="${INK}" stroke-width="4.5"/>`;
      break;
    case 'wave':
      s += L('M-28 8 Q-21 -3 -14 7 T0 6 T14 4 T28 -4', 4.5);
      break;
    case 'grit':
      s += `<clipPath id="MOUTHCLIP"><path d="M-32 18 Q0 -6 32 18 L25 31 Q0 13 -25 31Z"/></clipPath>`;
      s += P('M-32 18 Q0 -6 32 18 L25 31 Q0 13 -25 31Z', '#fff', 4.5);
      s += `<g clip-path="url(#MOUTHCLIP)">${L('M-14 0 L-14 40 M0 0 L0 40 M14 0 L14 40 M-40 15 Q0 38 40 15', 2.6)}</g>`;
      break;
  }
  return s;
}

function symbols(kind, uid) {
  const star = (x, y, r, col) => `<path transform="translate(${x} ${y}) scale(${r / 16})" d="M0 -16 Q2 -2 16 0 Q2 2 0 16 Q-2 2 -16 0 Q-2 -2 0 -16Z" fill="${col}" stroke="${INK}" stroke-width="${3 * 16 / r}" stroke-linejoin="round"/>`;
  switch (kind) {
    case 'sparkles': return star(446, 150, 20, '#ffe45e') + star(470, 206, 12, '#7df5da') + star(62, 168, 14, '#ffe45e');
    case 'gloom':
      return [0, 1, 2].map((i) => L(`M${430 + i * 16} ${96} L${430 + i * 16} ${128 + (i % 2) * 14}`, 6, '#7aa0e8')).join('') ;
    case 'shock':
      return [L('M436 120 L462 98', 6), L('M446 160 L478 156', 6), L('M76 120 L50 98', 6), L('M66 160 L34 156', 6)].join('');
    case 'question': {
      const q = 'M-13 -14 C-13 -34 15 -34 15 -14 C15 -2 1 -2 1 12';
      const g = `<g transform="translate(442 150) rotate(12)">${L(q, 17, INK)}${L('M1 30 L1 30', 19, INK)}${L(q, 8, '#fff')}${L('M1 30 L1 30', 10, '#fff')}</g>`;
      return g;
    }
    case 'anger': {
      const arc = (rot) => `<g transform="translate(446 138) rotate(${rot})">${L('M-20 -8 Q-8 -8 -8 -20', 13, INK)}${L('M-20 -8 Q-8 -8 -8 -20', 6, '#ff4d5a')}</g>`;
      return [0, 90, 180, 270].map(arc).join('');
    }
    default: return '';
  }
}

// ---------------------------------------------------------------- montagem
function bodyShape(ctx, { fill, nw = 54, nl = 26, shade = true, extra = '' }) {
  const p = ctx.p, xl = p.xl;
  const Lx = 256 - nw, Rx = 256 + nw;
  const d = `M${Lx} 520 C${Lx - 52} 526 ${xl + 40} 548 ${xl + 8} 600 L${xl} 640 L${512 - xl} 640 L${512 - xl - 8} 600 C${512 - xl - 40} 548 ${Rx + 52} 526 ${Rx} 520 C${Rx - 12} ${520 + nl} ${Lx + 12} ${520 + nl} ${Lx} 520Z`;
  const id = `${ctx.uid}bd`;
  let s = `<clipPath id="${id}"><path d="${d}"/></clipPath>`;
  s += P(d, fill, 5);
  if (shade) s += `<g clip-path="url(#${id})"><path d="M340 500 L520 500 L520 640 L330 640 Q350 560 340 500Z" fill="#000" opacity="0.16"/></g>`;
  s += extra;
  s += P(d, 'none', 5);
  return s;
}

function avatar(c, exprName = 'feliz', uid = 'a') {
  const p = { ...PROFILES[c.profile], ...(c.pOver || {}) };
  const E = EXPR[exprName](p);
  const exL = 256 - p.dx, exR = 256 + p.dx;
  const ctx = { uid, c, p, exL, exR, ey: p.ey, E };
  const faceD = FACES[c.profile === 'elder' ? 'adult' : c.profile];
  ctx.faceD = faceD;
  const parts = c.parts(ctx);
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 640" width="512" height="640">`;
  s += `<defs><linearGradient id="${uid}ig" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.eyeCols[0]}"/><stop offset="0.55" stop-color="${c.eyeCols[1]}"/><stop offset="1" stop-color="${c.eyeCols[2]}"/></linearGradient>`;
  s += `<clipPath id="${uid}face"><path d="${faceD}"/></clipPath>`;
  const nk = p.neck;
  const neckD = `M${256 - nk} 420 L${256 - nk - 2} 548 L${256 + nk + 2} 548 L${256 + nk} 420Z`;
  s += `<clipPath id="${uid}neck"><path d="${neckD}"/></clipPath></defs>`;

  const dy = p.dy;
  const H0 = `<g transform="translate(0 ${dy})">`;
  s += H0 + (parts.back || '');
  if (p.ear) {
    const ear = (x) => `<ellipse cx="${x}" cy="${p.ey + 4}" rx="16" ry="25" fill="${c.skin}" stroke="${INK}" stroke-width="4.5"/><path d="M${x + (x < 256 ? 3 : -3)} ${p.ey - 6} Q${x + (x < 256 ? -4 : 4)} ${p.ey + 4} ${x + (x < 256 ? 3 : -3)} ${p.ey + 16}" fill="none" stroke="${c.skinLine || '#c98f62'}" stroke-width="3" stroke-linecap="round"/>`;
    s += ear(147) + ear(365);
  }
  s += '</g>';
  if (parts.preNeck) s += parts.preNeck;
  // pescoço + sombra do queixo
  s += H0;
  s += `<path d="${neckD}" fill="${c.skin}"/>`;
  s += `<g clip-path="url(#${uid}neck)"><path d="${faceD}" transform="translate(0 30)" fill="${c.skinShade}"/></g>`;
  s += L(`M${256 - nk} 420 L${256 - nk - 2} 548 M${256 + nk} 420 L${256 + nk + 2} 548`, 5);
  s += '</g>';
  s += parts.body || '';
  s += parts.bodyFront || '';
  // rosto (tudo daqui em diante desce junto com a cabeça)
  s += H0;
  s += P(faceD, c.skin, 5);
  s += parts.faceDecor || '';           // rugas, sombras
  // blush
  if (c.blush && E.blush) {
    const op = Math.min(1, 0.9 * E.blush);
    const by = p.ey + p.ry + 28;
    const hatch = (x) => [0, 1, 2].map((i) => L(`M${x + i * 13} ${by} l14 -13`, 3.4, c.blush, `opacity="${op}"`)).join('');
    s += hatch(exL - 24) + hatch(exR - 14);
  }
  s += parts.beard || '';
  s += `<g transform="translate(256 ${p.my}) scale(${p.mscale})">${mouthSVG(E.mouth, p.mscale, c.mouthInk || INK).replace(/MOUTHCLIP/g, uid + 'mc')}</g>`;
  s += `<ellipse cx="256" cy="${p.ny}" rx="3.6" ry="4.6" fill="${c.noseColor || INK}" opacity="0.85"/>`;
  s += parts.mustache || '';
  // olhos
  s += `<g transform="translate(${exL} ${p.ey})">${eyeSVG(uid, 'L', p, c, E.eyeL)}</g>`;
  s += `<g transform="translate(${exR} ${p.ey}) scale(-1 1)">${eyeSVG(uid, 'R', p, c, E.eyeR)}</g>`;
  s += parts.eyewear || '';
  s += parts.front || '';
  // sobrancelhas (por cima do cabelo)
  const bcol = c.browColor || INK;
  const bw = c.browW || 5.5;
  const browL = E.browL, browR = E.browR || E.browL;
  s += `<g transform="translate(${exL} ${p.ey})">${L(browL, bw, bcol)}</g>`;
  s += `<g transform="translate(${exR} ${p.ey}) scale(-1 1)">${L(browR, bw, bcol)}</g>`;
  s += parts.over || '';
  if (!c.noSymbols) s += symbols(E.sym, uid);
  return s + '</g></svg>';
}

module.exports = { avatar, INK, P, L, mirror, symPath, bodyShape, PROFILES, EXPR, n1 };
