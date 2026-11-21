// Elenco de apoio no mesmo estilo da Livy: cada personagem é a base da referência recolorida
// (variantes.py) + corpo, acessórios e expressões desenhados por cima, no mesmo traço fino.
const fs = require('fs');
const path = require('path');
const { INK, L, mirror, symPath, bodyShape, symbols, PROFILES } = require('./engine');
const { chars } = require('./personagens');

const LINE = '#16121a';
const HS = 0.84, HX = 40, HY = 58, MIRX = 509;
const ln = (d, w = 3, col = LINE, extra = '') =>
  `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const shape = (d, fill, w = 2.4, extra = '') => `<path d="${d}" fill="${fill}" stroke="${LINE}" stroke-width="${w}" stroke-linejoin="round" ${extra}/>`;
const mirNative = (s) => `<g transform="translate(${MIRX} 0) scale(-1 1)">${s}</g>`;
const mir256 = (s) => `<g transform="translate(512 0) scale(-1 1)">${s}</g>`;      // espelho em torno do eixo do rosto
const thin = (s, k = 0.62) => s.replace(/stroke-width="([\d.]+)"/g, (m, w) => `stroke-width="${(+w * k).toFixed(2)}"`);
const b64 = {};
const baseUri = (k) => b64[k] || (b64[k] = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, '..', 'base', `${k}-base.png`)).toString('base64'));

// ---------------------------------------------------------------- expressões (sobre o rosto original)
const lidCut = (skin, [yo, yi]) =>
  `<polygon points="122,272 210,272 210,${yi} 122,${yo}" fill="${skin}"/>`
  + ln(`M122 ${yo + 1} L212 ${yi + 1}`, 6, LINE) + ln(`M122 ${yo} Q112 ${yo - 3} 106 ${yo + 8}`, 4.5, LINE);
const bigEye = (uid, base, side, k) => {
  const id = `${uid}be${side}`;
  return `<clipPath id="${id}r"><rect x="124" y="262" width="110" height="110"/></clipPath>`
    + `<clipPath id="${id}e"><ellipse cx="172" cy="320" rx="56" ry="42"/></clipPath>`
    + `<g clip-path="url(#${id}r)"><g clip-path="url(#${id}e)"><g transform="translate(126 320) scale(${k}) translate(-126 -320)"><image href="${base}" x="0" y="0" width="514" height="640"/></g></g></g>`;
};
const tear = (x, y) => `<path d="M${x} ${y} C${x - 11} ${y + 15} ${x - 11} ${y + 33} ${x} ${y + 35} C${x + 11} ${y + 33} ${x + 11} ${y + 15} ${x} ${y}Z" fill="#a8e0ff" stroke="${LINE}" stroke-width="2.4" stroke-linejoin="round"/>`
  + `<ellipse cx="${x - 3.5}" cy="${y + 24}" rx="2.4" ry="5" fill="#fff"/>`;

function mouths(skin, lc, uid, patch) {
  const P = patch ? `<ellipse cx="258" cy="443" rx="54" ry="24" fill="${skin}"/>` : '';
  const open = `M231 438 Q259 452 287 438 Q283 468 259 470 Q235 468 231 438Z`;
  return {
    feliz: P + `<clipPath id="${uid}mo"><path d="${open}"/></clipPath>`
      + `<path d="${open}" fill="#8b2332"/><g clip-path="url(#${uid}mo)"><ellipse cx="259" cy="466" rx="16" ry="9" fill="#f2707f"/><path d="M228 436 L290 436 L290 446 Q259 456 228 446Z" fill="#fff"/></g>`
      + `<path d="${open}" fill="none" stroke="${LC(lc)}" stroke-width="2.8" stroke-linejoin="round"/>`,
    sorriso: P + ln('M236 443 Q259 459 282 443', 3.2, LC(lc)) + ln('M233 439 L238 446 M285 439 L280 446', 2.4, LC(lc)),
    neutro: P + ln('M243 447 Q259 451 275 447', 3.2, LC(lc)),
    triste: P + ln('M236 453 Q247 440 259 447 Q271 440 282 453', 3.4, LC(lc)),
    surpreso: P + `<ellipse cx="259" cy="445" rx="12" ry="17" fill="#7a1f2b" stroke="${LC(lc)}" stroke-width="3"/><ellipse cx="259" cy="454" rx="8" ry="5.5" fill="#f2707f"/>`,
    confuso: P + ln('M232 448 Q239 438 246 447 T260 446 T274 444 T286 438', 3.4, LC(lc)),
    bravo: P + `<clipPath id="${uid}mg"><path d="M232 450 Q259 430 286 450 L279 462 Q259 446 239 462Z"/></clipPath>`
      + `<path d="M232 450 Q259 430 286 450 L279 462 Q259 446 239 462Z" fill="#fff" stroke="${LC(lc)}" stroke-width="3" stroke-linejoin="round"/>`
      + `<g clip-path="url(#${uid}mg)">${ln('M247 436 L247 470 M259 436 L259 470 M271 436 L271 470 M228 454 Q259 474 290 454', 2, LC(lc))}</g>`,
  };
}
const LC = (c) => c || LINE;

const BROWS = {
  feliz: ['M132 270 Q168 256 204 268'],
  sorriso: ['M132 272 Q168 262 204 270'],
  neutro: ['M130 274 Q168 268 205 272'],
  triste: ['M128 290 Q166 280 205 262'],
  surpreso: ['M134 262 Q168 248 204 258'],
  confuso: ['M130 270 Q168 250 205 262', 'M128 262 L205 280'],
  bravo: ['M126 262 L206 292'],
};
const FX = {
  triste: { L: [332, 292], R: [332, 292], tear: true },
  bravo: { L: [298, 330], R: [298, 330] },
  confuso: { R: [314, 312] },
};
const SYM = { feliz: 'sparkles', triste: 'gloom', surpreso: 'shock', confuso: 'question', bravo: 'anger' };

// ---------------------------------------------------------------- personagens
const hairLock = (fill, shade) => (
  shape('M64 250 C34 380 22 500 40 612 L74 648 L108 604 L136 640 L178 580 C146 520 128 440 128 340Z', fill, 2.4)
  + ln('M62 380 C52 470 50 550 56 620 M96 400 C88 480 90 560 100 620', 2, shade, 'opacity="0.8"'));

const CAST = {
  pai: {
    skin: '#e8b88b', nw: 58, brow: ['#1f140e', 5.4],
    faceFx: () => `<clipPath id="UIDfc"><path d="M118 330 C117 392 160 470 222 498 C238 504 247 506 256 506 C265 506 274 504 290 498 C352 470 395 392 394 330 L394 200 L118 200Z"/></clipPath>`
      + `<g clip-path="url(#UIDfc)"><path d="M118 392 C160 436 210 446 256 444 C302 446 352 436 394 392 L394 520 L118 520Z" fill="#2b1a12" opacity="0.2"/></g>`,
  },
  mae: {
    skin: '#ffdcb6', nw: 60, brow: null,
    behindHead: () => '', frontOfBody: () => hairLock('#6e3622', '#3d1b10') + mir256(hairLock('#6e3622', '#3d1b10')),
  },
  avo: {
    skin: '#f1c9a2', nw: 62, brow: ['#c5cad6', 6.2], browOutline: true,
    faceFx: () => ln('M205 398 Q194 430 208 458 M303 398 Q314 430 300 458', 2.4, '#b58a62')
      + ln('M134 366 Q157 374 182 366 M330 366 Q353 374 378 366', 2.2, '#b58a62')
      + ln('M104 296 l-10 -5 M104 308 l-12 1 M104 320 l-10 6', 2.2, '#b58a62') + mirNative(ln('M104 296 l-10 -5 M104 308 l-12 1 M104 320 l-10 6', 2.2, '#b58a62')),
    mustache: () => { const d = symPath([256, 410], [['C', 238, 402, 212, 404, 194, 420], ['C', 188, 432, 202, 438, 214, 431], ['C', 230, 424, 244, 424, 256, 426]]); return shape(d, '#f3f3f6', 2.6) + ln('M214 414 Q234 412 248 418 M298 414 Q278 412 264 418', 1.8, '#b9bec9'); },
    eyewear: () => {
      const g = (cx) => `<ellipse cx="${cx}" cy="320" rx="58" ry="47" fill="#cfe9ff" opacity="0.18"/><ellipse cx="${cx}" cy="320" rx="58" ry="47" fill="none" stroke="${LINE}" stroke-width="6"/><ellipse cx="${cx}" cy="320" rx="58" ry="47" fill="none" stroke="#7a5a3a" stroke-width="3.2"/>` + ln(`M${cx - 36} 296 l16 -7`, 3, '#fff', 'opacity="0.9"');
      return g(157) + g(352) + ln('M214 314 Q256 300 295 314', 6, LINE) + ln('M214 314 Q256 300 295 314', 3, '#7a5a3a');
    },
  },
  irma: {
    skin: '#fbd7b3', nw: 62, brow: null,
    behindHead: () => shape('M318 90 C430 28 520 140 508 276 C502 366 470 436 442 526 C420 470 442 402 430 332 C420 262 380 188 318 150Z', '#6a1a3a', 2.4)
      + ln('M440 150 C470 230 466 330 448 440 M410 170 C440 240 436 330 428 380', 2.2, '#ec8fb0', 'opacity="0.75"'),
    front: () => `<ellipse cx="352" cy="74" rx="16" ry="26" transform="rotate(34 352 74)" fill="#ffd23a" stroke="${LINE}" stroke-width="2.6"/>`
      + [112, 400].map((x) => `<circle cx="${x}" cy="414" r="15" fill="none" stroke="${LINE}" stroke-width="6"/><circle cx="${x}" cy="414" r="15" fill="none" stroke="#ffd24d" stroke-width="3"/>`).join(''),
  },
  professora: {
    skin: '#c58c61', nw: 60, brow: ['#2a1008', 4.4],
    behindHead: () => `<ellipse cx="256" cy="14" rx="54" ry="46" fill="#5a2212" stroke="${LINE}" stroke-width="2.6"/>`
      + `<ellipse cx="256" cy="10" rx="44" ry="36" fill="#74301b"/>` + ln('M222 12 Q256 -14 292 12 M232 30 Q256 14 282 30', 2, '#4a1a0c')
      + `<rect x="214" y="52" width="84" height="14" rx="7" fill="#f2c94c" stroke="${LINE}" stroke-width="2.6"/>`,
    eyewear: () => {
      const r = (x) => `<rect x="${x}" y="282" width="108" height="76" rx="24" fill="#cfe9ff" opacity="0.18"/><rect x="${x}" y="282" width="108" height="76" rx="24" fill="none" stroke="${LINE}" stroke-width="6"/><rect x="${x}" y="282" width="108" height="76" rx="24" fill="none" stroke="#1f9a9a" stroke-width="3.2"/>` + ln(`M${x + 20} 298 l16 -5`, 3, '#fff', 'opacity="0.9"');
      return r(103) + r(303) + ln('M211 306 Q256 294 303 306', 6, LINE) + ln('M211 306 Q256 294 303 306', 3, '#1f9a9a');
    },
  },
  vizinho: {
    skin: '#a8714b', nw: 62, brow: ['#0e0907', 6], beard: true, lc: '#f3c9b4',
    beardFx: () => shape('M112 356 C112 452 170 524 256 532 C342 524 400 452 400 356 C380 394 352 410 320 410 C300 402 276 408 256 408 C236 408 212 402 192 410 C160 410 132 394 112 356Z', '#0b0807', 2.6)
      + ln('M170 470 Q200 500 236 512 M342 470 Q312 500 276 512', 2, '#5a463a', 'opacity="0.7"'),
    mustache: () => { const d = symPath([256, 412], [['C', 236, 403, 210, 404, 190, 420], ['C', 182, 433, 198, 440, 212, 433], ['C', 230, 426, 244, 425, 256, 428]]); return shape(d, '#0b0807', 2.6) + ln('M208 414 Q228 412 246 418 M304 414 Q284 412 266 418', 1.8, '#5a463a', 'opacity="0.7"'); },
    cap: () => `<g transform="translate(0 -18)">` + shape('M76 226 C70 100 150 6 256 4 C362 6 442 100 436 226 C380 246 132 246 76 226Z', '#c93a32', 2.8)
      + ln('M256 8 L256 240 M196 22 Q176 130 184 238 M316 22 Q336 130 328 238', 1.8, '#7d1713')
      + `<circle cx="256" cy="10" r="9" fill="#7d1713" stroke="${LINE}" stroke-width="2.4"/>`
      + shape('M56 230 C150 262 362 262 456 230 C446 272 360 292 256 292 C152 292 66 272 56 230Z', '#9d2620', 2.8)
      + `<rect x="222" y="104" width="68" height="52" rx="16" fill="#ffe45e" stroke="${LINE}" stroke-width="2.6"/>` + ln('M238 138 Q256 112 276 138 M242 132 L272 132', 3, LINE) + '</g>',
  },
  seguranca: {
    skin: '#86573c', nw: 68, brow: ['#0b0809', 6.2],
    cap: () => `<g transform="translate(0 -16)">` + shape('M70 224 C66 110 140 20 256 18 C372 20 446 110 442 224 C380 244 132 244 70 224Z', '#1c2d57', 2.8)
      + shape('M72 212 C140 236 372 236 440 212 L442 232 C380 254 132 254 70 232Z', '#0f1830', 2.4)
      + shape('M112 244 C190 266 322 266 400 244 C390 282 330 296 256 296 C182 296 122 282 112 244Z', '#0b0b10', 2.8)
      + `<path d="M256 96 l30 12 v26 q0 24 -30 38 q-30 -14 -30 -38 v-26z" fill="#ffd24d" stroke="${LINE}" stroke-width="2.6" stroke-linejoin="round"/>`
      + `<path d="M256 118 l7 14 l15 2 l-11 10 l3 15 l-14 -8 l-14 8 l3 -15 l-11 -10 l15 -2z" fill="#fff4b8" stroke="${LINE}" stroke-width="1.6"/></g>`,
    earpiece: () => ln('M402 336 C436 400 424 476 374 548', 6, LINE) + ln('M402 336 C436 400 424 476 374 548', 2.4, '#e2e2f0', 'stroke-dasharray="1 5"')
      + `<rect x="394" y="318" width="14" height="30" rx="7" fill="#15151f" stroke="${LINE}" stroke-width="2.4"/>`,
  },
};

function avatarCast(k, expr = 'feliz', uid = 'a') {
  const spec = CAST[k], c = chars[k];
  const skin = spec.skin, base = baseUri(k);
  const prof = { ...PROFILES[c.profile], ...(c.pOver || {}) };
  const ctx = { uid, c, p: prof, exL: 256 - prof.dx, exR: 256 + prof.dx, ey: prof.ey };
  const parts = c.parts(ctx);
  const head = `translate(${HX} ${HY}) scale(${HS})`;
  const patch = !spec.beard;
  const mo = mouths(skin, spec.lc, uid, patch);

  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 640" width="512" height="640">`;
  if (spec.behindHead) s += `<g transform="${head}">${spec.behindHead()}</g>`;
  // pescoço + corpo
  const nw = spec.nw;
  s += `<path d="M205 470 L205 500 L${256 - nw - 2} 548 L${256 + nw + 2} 548 L309 500 L309 470Z" fill="${skin}"/>`;
  s += thin(parts.body || '');
  if (spec.frontOfBody) s += `<g transform="${head}">${spec.frontOfBody()}</g>`;
  // cabeça original + expressão
  s += `<g transform="${head}"><image href="${base}" x="0" y="0" width="514" height="640"/>`;
  if (spec.faceFx) s += spec.faceFx().replace(/UID/g, uid);
  const fx = FX[expr] || {};
  if (expr === 'surpreso') s += bigEye(uid, base, 'L', 1.13) + mirNative(bigEye(uid, base, 'R', 1.13));
  else {
    if (fx.L) s += lidCut(skin, fx.L);
    if (fx.R) s += mirNative(lidCut(skin, fx.R));
    if (fx.tear) s += tear(143, 350);
  }
  if (spec.beardFx) s += spec.beardFx();
  const origMouth = expr === 'feliz' && !spec.beard;                    // o sorriso original só vale para a "feliz"
  if (!origMouth) s += mo[expr];
  if (spec.mustache) s += spec.mustache();
  if (spec.eyewear) s += spec.eyewear();
  // sobrancelhas
  const needBrow = spec.brow && true || expr !== 'feliz' && expr !== 'sorriso' && expr !== 'neutro';
  if (needBrow) {
    const [col, w] = spec.brow || ['#2b2b36', 3.6];
    const arr = BROWS[expr];
    const draw = (d, wCol) => (spec.browOutline ? ln(d, w + 3, LINE) : '') + ln(d, w, wCol);
    s += draw(arr[0], col) + mirNative(draw(arr[1] || arr[0], col));
  }
  if (spec.cap) s += spec.cap();
  if (spec.front) s += spec.front();
  if (spec.earpiece) s += spec.earpiece();
  s += '</g>';
  const sym = SYM[expr];
  if (sym) s += `<g transform="translate(0 -36)">${symbols(sym, uid)}</g>`;
  return s + '</svg>';
}

module.exports = { avatarCast, CAST };
