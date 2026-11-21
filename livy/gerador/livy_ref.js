// Livy montada em cima da imagem de referência: rosto, cabelo e olhos são os do desenho original.
// As expressões só acrescentam pálpebra, sobrancelha, lágrima e boca por cima, no mesmo traço.
const fs = require('fs');
const path = require('path');
const { INK, L, mirror, bodyShape, symbols } = require('./engine');

const BASE = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, '..', 'base', 'livy-base-recorte.png')).toString('base64');
const SKIN = '#ffdeb8';          // cor de pele medida na referência
const LINE = '#16121a';
const HOODIE = '#3a2578', HOODIE_DARK = '#24124f';

// cabeça: coordenadas nativas da referência (514x640) -> tela 512x640
const HS = 0.84, HX = 40, HY = 58;
const MIRX = 509;                // eixo de simetria dos olhos da referência (157 <-> 352)

const ln = (d, w = 3, col = LINE, extra = '') =>
  `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const mirNative = (s) => `<g transform="translate(${MIRX} 0) scale(-1 1)">${s}</g>`;

// ---- olhos (coordenadas do olho esquerdo; o direito é o espelho)
// cut = [y no canto externo (x=124), y no canto interno (x=214)]
function lidCut(cut) {
  const [yo, yi] = cut;
  return `<polygon points="122,272 210,272 210,${yi} 122,${yo}" fill="${SKIN}"/>`
    + ln(`M122 ${yo + 1} L212 ${yi + 1}`, 6, LINE)
    + ln(`M122 ${yo} Q112 ${yo - 3} 106 ${yo + 8}`, 4.5, LINE);
}
// olho maior (surpresa): cópia ampliada do próprio olho, presa no canto externo
function bigEye(uid, side, k) {
  const id = `${uid}be${side}`;
  return `<clipPath id="${id}r"><rect x="124" y="262" width="110" height="110"/></clipPath>`
    + `<clipPath id="${id}e"><ellipse cx="172" cy="320" rx="56" ry="42"/></clipPath>`
    + `<g clip-path="url(#${id}r)"><g clip-path="url(#${id}e)"><g transform="translate(126 320) scale(${k}) translate(-126 -320)"><image href="${BASE}" x="0" y="0" width="514" height="640"/></g></g></g>`;
}
const tear = (x, y) => `<path d="M${x} ${y} C${x - 11} ${y + 15} ${x - 11} ${y + 33} ${x} ${y + 35} C${x + 11} ${y + 33} ${x + 11} ${y + 15} ${x} ${y}Z" fill="#a8e0ff" stroke="${LINE}" stroke-width="2.4" stroke-linejoin="round"/>`
  + `<ellipse cx="${x - 3.5}" cy="${y + 24}" rx="2.4" ry="5" fill="#fff"/>`;

// ---- bocas (centro da boca original: 259,443)
const patchMouth = `<ellipse cx="258" cy="443" rx="54" ry="24" fill="${SKIN}"/>`;
const MOUTH = {
  triste: patchMouth + ln('M236 453 Q247 440 259 447 Q271 440 282 453', 3.4),
  surpreso: patchMouth + `<ellipse cx="259" cy="445" rx="12" ry="17" fill="#7a1f2b" stroke="${LINE}" stroke-width="3.2"/><ellipse cx="259" cy="454" rx="8" ry="5.5" fill="#f2707f"/>`,
  confuso: patchMouth + ln('M232 448 Q239 438 246 447 T260 446 T274 444 T286 438', 3.4),
  bravo: patchMouth
    + `<clipPath id="UIDmg"><path d="M232 450 Q259 430 286 450 L279 462 Q259 446 239 462Z"/></clipPath>`
    + `<path d="M232 450 Q259 430 286 450 L279 462 Q259 446 239 462Z" fill="#fff" stroke="${LINE}" stroke-width="3.2" stroke-linejoin="round"/>`
    + `<g clip-path="url(#UIDmg)">${ln('M247 436 L247 470 M259 436 L259 470 M271 436 L271 470 M228 454 Q259 474 290 454', 2)}</g>`,
};

// ---- sobrancelhas (olho esquerdo; direito = espelho, salvo indicação)
const BROW = {
  triste: ln('M128 290 Q166 280 205 262', 3.6),
  surpreso: ln('M134 262 Q168 248 204 258', 3.6),
  confuso: ln('M130 270 Q168 250 205 262', 3.6),
  confusoR: ln('M128 262 L205 280', 3.6),
  bravo: ln('M126 262 L206 292', 3.8),
};
const EYEFX = {
  triste: { L: lidCut([332, 292]), R: lidCut([332, 292]), tearL: true },
  bravo: { L: lidCut([298, 330]), R: lidCut([298, 330]) },
  confuso: { L: '', R: lidCut([314, 312]) },
};

function avatarLivy(expr = 'feliz', uid = 'a') {
  const hasFx = expr !== 'feliz';
  let s = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 640" width="512" height="640">`;
  // pescoço (a referência só tem a sombra sob o queixo) + moletom
  s += `<path d="M205 470 L205 500 L192 548 L320 548 L309 500 L309 470Z" fill="${SKIN}"/>`;
  const ctx = { uid, p: { xl: 52 } };
  const folds = L('M92 618 Q120 590 150 604 M420 618 Q392 590 362 604', 3, '#1d0f3e', 'opacity="0.7"');
  s += bodyShape(ctx, { fill: HOODIE, nw: 62, nl: 26, extra: folds, sw: 3.2 });
  const band = () => { const d = 'M150 556 C146 524 160 500 190 506'; return `${L(d, 13, INK)}${L(d, 8, '#f4eee2')}`; };
  s += band() + mirror(band());

  // cabeça original + ajustes de expressão
  s += `<g transform="translate(${HX} ${HY}) scale(${HS})">`;
  s += `<image href="${BASE}" x="0" y="0" width="514" height="640"/>`;
  if (hasFx) {
    // olhos
    if (expr === 'surpreso') {
      s += bigEye(uid, 'L', 1.13) + mirNative(bigEye(uid, 'R', 1.13));
    } else {
      const fx = EYEFX[expr];
      s += fx.L + mirNative(fx.R);
      if (fx.tearL) s += tear(143, 350);
    }
    // sobrancelhas
    s += BROW[expr] + mirNative(expr === 'confuso' ? BROW.confusoR : BROW[expr]);
    // boca
    s += MOUTH[expr].replace(/UID/g, uid);
  }
  s += '</g>';

  // gola, cordões e fone (sempre iguais)
  s += `<path d="M194 520 C208 560 304 560 318 520" fill="none" stroke="${INK}" stroke-width="18" stroke-linecap="round"/>`
    + `<path d="M194 520 C208 560 304 560 318 520" fill="none" stroke="${HOODIE_DARK}" stroke-width="12" stroke-linecap="round"/>`;
  const cord = (x1, x2) => `${L(`M${x1} 566 C${x1 - 4} 590 ${x1 + 2} 608 ${x1 - 4} 628`, 7, INK)}${L(`M${x1} 566 C${x1 - 4} 590 ${x1 + 2} 608 ${x1 - 4} 628`, 3.6, '#efe8ff')}`
    + `<ellipse cx="${x1 - 4}" cy="631" rx="5" ry="7" fill="#efe8ff" stroke="${INK}" stroke-width="3"/>`;
  s += cord(228) + cord(292);
  const cup = (cx, cy, rot) => `<g transform="translate(${cx} ${cy}) rotate(${rot})">`
    + `<rect x="-31" y="-44" width="62" height="88" rx="27" fill="#f4eee2" stroke="${INK}" stroke-width="3.4"/>`
    + `<rect x="-20" y="-32" width="40" height="64" rx="18" fill="#2b1a55" stroke="${INK}" stroke-width="2.4"/>`
    + `<rect x="-14" y="-26" width="28" height="52" rx="13" fill="#3de0c2"/>`
    + `<rect x="-8" y="-19" width="6" height="20" rx="3" fill="#fff" opacity="0.85"/></g>`;
  s += cup(122, 580, -12) + cup(390, 580, 12);

  // símbolos de emoção (nos cantos superiores)
  const sym = { feliz: 'sparkles', triste: 'gloom', surpreso: 'shock', confuso: 'question', bravo: 'anger' }[expr];
  s += `<g transform="translate(0 -36)">${symbols(sym, uid)}</g>`;
  return s + '</svg>';
}

module.exports = { avatarLivy };
