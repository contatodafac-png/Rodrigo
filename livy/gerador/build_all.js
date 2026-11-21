// Gera todos os arquivos: SVG + PNG transparente (1024x1280) e as 3 folhas de apresentação.
// Uso: node build_all.js
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { avatar } = require('./engine');
const { chars } = require('./personagens');
const { avatarLivy } = require('./livy_ref');
const { avatarCast } = require('./ref_cast');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'avatares');
const FOLHAS = path.join(ROOT, 'folhas');
const mk = (d) => fs.mkdirSync(d, { recursive: true });

const MAIN5 = ['feliz', 'triste', 'surpreso', 'confuso', 'bravo'];
const ELENCO = [
  { k: 'pai', nome: 'Renato', papel: 'Pai', idade: 38, padrao: 'feliz', tom: '#ffe9b8',
    quem: 'Mão na massa, piada ruim e confiança demais. Todo conserto dele vira episódio.',
    voz: 'Grave e caloroso. “Calma, filha, eu tenho tudo sob controle.”' },
  { k: 'mae', nome: 'Carol', papel: 'Mãe', idade: 36, padrao: 'sorriso', tom: '#ffd9d4',
    quem: 'A que realmente sabe de tudo. Paciente até contar até três.',
    voz: 'Firme e carinhosa. “Livy. Olha pra mim.”' },
  { k: 'avo', nome: 'Vô Tonho', papel: 'Avô', idade: 71, padrao: 'feliz', tom: '#dcebd2',
    quem: 'Contador de causos, exagera tudo e é cúmplice das travessuras da Livy.',
    voz: 'Rouco e devagar. “No meu tempo era pior… e melhor.”' },
  { k: 'irma', nome: 'Duda', papel: 'Irmã adulta', idade: 24, padrao: 'feliz', tom: '#d6e4f5',
    quem: 'Implica o tempo todo, mas é a primeira a defender a Livy.',
    voz: 'Rápida e sarcástica. “Sério, Livy? De novo?”' },
  { k: 'professora', nome: 'Profa. Helena', papel: 'Professora', idade: 40, padrao: 'sorriso', tom: '#cfeceb',
    quem: 'Adora perguntas… até a quadragésima sétima do dia.',
    voz: 'Clara e didática. “Boa pergunta! Vamos anotar.”' },
  { k: 'vizinho', nome: 'Seu Jorge', papel: 'Vizinho', idade: 45, padrao: 'neutro', tom: '#ffe0c2',
    quem: 'Resmungão só na aparência. Dono do quintal “proibido” e do cachorro barulhento.',
    voz: 'Resmungado. “Mas que… de novo?”' },
  { k: 'seguranca', nome: 'Seu Tião', papel: 'Segurança', idade: 50, padrao: 'neutro', tom: '#d3dbef',
    quem: 'Leva o trabalho a sério demais. Sempre na porta errada, na hora errada.',
    voz: 'Formal e firme. “Aqui não pode, mocinha.”' },
];
const LABELS = {
  feliz: ['Feliz', 'a parte boa da história, o final feliz'],
  triste: ['Triste', 'o desfecho injusto, o castigo'],
  surpreso: ['Surpreso', 'a virada, o “não é possível”'],
  confuso: ['Confuso', 'quando o adulto explica algo sem sentido'],
  bravo: ['Bravo', 'quando ninguém acredita nela'],
};

const svgOf = (k, e, uid) => (k === 'livy' ? avatarLivy(e, uid) : avatarCast(k, e, uid));
const inline = (k, e, uid, w) => svgOf(k, e, uid).replace('width="512" height="640"', `width="${w}" height="${Math.round(w * 1.25)}"`);

const css = `
*{box-sizing:border-box}body{margin:0;font-family:Inter,'DejaVu Sans',sans-serif;color:#1f1238;background:#f3eefc}
.wrap{padding:56px 64px}
h1{margin:0;font-size:68px;letter-spacing:-1px;font-weight:800}
.sub{font-size:22px;color:#6b5a93;margin-top:6px;font-weight:500}
.card{background:#fff;border-radius:26px;padding:26px 30px;box-shadow:0 2px 0 #e3d9f7}
.card h3{margin:0 0 12px;font-size:15px;letter-spacing:2px;text-transform:uppercase;color:#7b5cc4;font-weight:800}
.chip{display:inline-block;background:#efe8ff;color:#3a2380;border-radius:999px;padding:7px 15px;margin:0 8px 8px 0;font-size:18px;font-weight:600}
.sw{display:flex;gap:14px;flex-wrap:wrap}.sw div{width:104px;font-size:14px;font-weight:600;line-height:1.25}
.sw i{display:block;height:46px;border-radius:12px;border:2.5px solid #15101d;margin-bottom:6px}
ul{margin:0;padding-left:22px;font-size:19px;line-height:1.5}li{margin-bottom:4px}
.bubble{background:#f4eefe;border-radius:18px;padding:14px 18px;font-size:19px;line-height:1.45;margin-top:10px;font-style:italic;color:#3a2380}
`;

(async () => {
  mk(OUT); mk(FOLHAS);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 512, height: 640 }, deviceScaleFactor: 2 });
  const shot = async (svg, out) => {
    await page.setViewportSize({ width: 512, height: 640 });
    await page.setContent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`);
    await page.screenshot({ path: out, omitBackground: true, clip: { x: 0, y: 0, width: 512, height: 640 } });
  };
  const save = async (k, e, dir, name) => {
    mk(dir);
    const svg = svgOf(k, e, 'x');
    fs.writeFileSync(path.join(dir, name + '.svg'), svg);
    await shot(svg, path.join(dir, name + '.png'));
  };

  // 1) Livy: 5 expressões pedidas + 2 de apoio
  for (const e of MAIN5) await save('livy', e, path.join(OUT, '1-livy'), `livy-${e}`);
  // 2) Elenco: avatar padrão + 5 expressões de cada
  for (const c of ELENCO) {
    await save(c.k, c.padrao, path.join(OUT, '2-elenco'), `${c.k}`);
    for (const e of MAIN5) await save(c.k, e, path.join(OUT, '2-elenco', 'expressoes'), `${c.k}-${e}`);
  }

  // 3) Folhas de apresentação
  const sheet = async (name, w, h, body) => {
    await page.setViewportSize({ width: w, height: h });
    await page.setContent(`<html><head><style>${css}</style></head><body>${body}</body></html>`);
    await page.screenshot({ path: path.join(FOLHAS, name), fullPage: true });
  };

  const palette = [
    ['Cabelo prata', '#E9E9E9'], ['Sombra cabelo', '#C4C4C4'], ['Roxo moletom', '#3A2578'], ['Roxo escuro', '#24124F'],
    ['Verde-menta', '#3DE0C2'], ['Creme (fone)', '#F4EEE2'], ['Âmbar (olhos)', '#FF9B1D'], ['Pele', '#FFDEB8'],
    ['Blush', '#EE8B8B'], ['Contorno', '#15101D'],
  ];
  const sw = palette.map(([n, h]) => `<div><i style="background:${h}"></i>${n}<br><span style="font-weight:500;color:#6b5a93">${h}</span></div>`).join('');
  const callout = (t) => `<span class="chip" style="background:#3de0c2;color:#0c2a24">${t}</span>`;
  await sheet('01-ficha-livy.png', 1800, 1160, `<div class="wrap">
    <h1>Livy</h1><div class="sub">Ficha de personagem · série de vídeos curtos verticais · narradora, 10 anos</div>
    <div style="display:grid;grid-template-columns:560px 1fr;gap:34px;margin-top:34px">
      <div class="card" style="padding:0;overflow:hidden;background:radial-gradient(circle at 50% 38%,#ffffff 0,#e9defc 62%,#d8c7f7 100%);display:flex;flex-direction:column;align-items:center;padding:26px 0 24px">
        ${inline('livy', 'feliz', 'f', 470)}
        <div style="margin-top:6px;text-align:center">${callout('Moletom roxo escuro')}${callout('Fone de ouvido nos ombros')}</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:22px;align-content:start">
        <div class="card"><h3>Quem é</h3><div style="font-size:20px;line-height:1.5"><b>Livy</b>, 10 anos, 5º ano. Curiosa, esperta demais para a idade e incapaz de deixar um mistério sem resolver. Conta as histórias da família olhando direto para a câmera, como quem fala com a melhor amiga.</div></div>
        <div class="card"><h3>Marcas fixas (nunca mudam)</h3><ul>
          <li>Rosto e cabelo <b>idênticos à referência</b>: chanel curto prateado, franja longa</li>
          <li><b>Fone de ouvido</b> creme com detalhe verde-menta, apoiado nos ombros</li>
          <li><b>Moletom roxo escuro</b> com cordões brancos</li>
          <li>Olhos grandes âmbar, blush em traços, nariz de ponto</li></ul></div>
        <div class="card" style="grid-column:1/3"><h3>Paleta</h3><div class="sw">${sw}</div></div>
        <div class="card"><h3>Personalidade</h3>
          <span class="chip">Curiosa demais</span><span class="chip">Observadora</span><span class="chip">Teimosa</span><span class="chip">Honesta (não sabe mentir)</span><span class="chip">Exagera um pouquinho</span><span class="chip">Medrosa com coisa boba</span><span class="chip">Corajosa no que importa</span></div>
        <div class="card"><h3>Jeito de falar</h3><ul>
          <li>Rápido e empolgado; frases curtas</li>
          <li>Abre sempre com um gancho</li>
          <li>Pausa dramática: “…e aí.”</li>
          <li>Imita a voz dos adultos</li></ul>
          <div class="bubble">“Gente, vocês não vão acreditar no que meu avô fez hoje. Spoiler: deu errado.”</div></div>
      </div></div></div>`);

  const exprCards = MAIN5.map((e, i) => `<div class="card" style="text-align:center;padding:20px 10px 22px;background:radial-gradient(circle at 50% 36%,#fff 0,#eadffd 70%,#dccbf8 100%)">
      ${inline('livy', e, 'e' + i, 300)}<div style="font-size:30px;font-weight:800;margin-top:2px">${LABELS[e][0]}</div>
      <div style="font-size:16px;color:#6b5a93;margin-top:4px;padding:0 14px;line-height:1.35">${LABELS[e][1]}</div></div>`).join('');
  await sheet('02-livy-expressoes.png', 1800, 760, `<div class="wrap" style="padding:44px 48px">
    <h1 style="font-size:52px">Livy · 5 expressões</h1><div class="sub" style="margin-bottom:26px">Só o rosto muda — cabelo, moletom e fone ficam idênticos em todos os episódios</div>
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:20px">${exprCards}</div></div>`);

  const castCard = (c, i) => `<div class="card" style="padding:0;overflow:hidden;display:flex;flex-direction:column">
      <div style="background:radial-gradient(circle at 50% 40%,#fff 0,${c.tom} 78%);display:flex;justify-content:center;padding-top:14px">${inline(c.k, c.padrao, 'c' + i, 300)}</div>
      <div style="padding:16px 22px 22px"><div style="font-size:15px;letter-spacing:2px;text-transform:uppercase;color:#7b5cc4;font-weight:800">${c.papel} · ${c.idade} anos</div>
      <div style="font-size:30px;font-weight:800;margin:2px 0 8px">${c.nome}</div>
      <div style="font-size:16.5px;line-height:1.4;margin-bottom:8px">${c.quem}</div>
      <div style="font-size:15.5px;line-height:1.4;color:#3a2380;font-style:italic">${c.voz}</div></div></div>`;
  const livyCard = `<div class="card" style="padding:0;overflow:hidden;display:flex;flex-direction:column;background:#3a2380;color:#fff">
      <div style="background:radial-gradient(circle at 50% 40%,#fff 0,#d8c7f7 78%);display:flex;justify-content:center;padding-top:14px">${inline('livy', 'feliz', 'cl', 300)}</div>
      <div style="padding:16px 22px 22px"><div style="font-size:15px;letter-spacing:2px;text-transform:uppercase;color:#3de0c2;font-weight:800">Protagonista · 10 anos</div>
      <div style="font-size:30px;font-weight:800;margin:2px 0 8px">Livy</div>
      <div style="font-size:16.5px;line-height:1.4">Mesma linha, mesmos olhos, mesmo blush: o elenco inteiro é desenhado com as regras dela.</div></div></div>`;
  await sheet('03-elenco.png', 1800, 1500, `<div class="wrap" style="padding:44px 48px">
    <h1 style="font-size:52px">Elenco de apoio</h1><div class="sub" style="margin-bottom:26px">7 personagens no mesmo estilo da Livy · cada um tem as 5 expressões na pasta avatares/2-elenco/expressoes</div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:22px">${ELENCO.map(castCard).join('')}${livyCard}</div></div>`);

  await browser.close();
  console.log('ok');
})();
