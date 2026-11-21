// teste rápido: renderiza personagens/expressões numa folha em fundo claro
const { avatar } = require('./engine');
const { chars } = require('./personagens');
const { chromium } = require('playwright');
const [, , who = 'livy', exprs = 'feliz,triste,surpreso,confuso,bravo', out = '/tmp/teste.png'] = process.argv;
(async () => {
  const list = exprs.split(',');
  let html = `<html><body style="margin:0;background:#f1ecf9;display:flex;flex-wrap:wrap;width:${list.length >= 5 ? 5 * 340 : list.length * 340}px">`;
  list.forEach((e, i) => {
    const [w, ex] = e.includes(':') ? e.split(':') : [who, e];
    const svg = avatar(chars[w], ex, 'u' + i).replace('width="512" height="640"', 'width="340" height="425"');
    html += svg;
  });
  html += '</body></html>';
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1700, height: 900 }, deviceScaleFactor: 1 });
  await p.setContent(html);
  await p.screenshot({ path: out, fullPage: true });
  await b.close();
  console.log('ok');
})();
