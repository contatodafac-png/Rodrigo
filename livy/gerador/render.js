// Renderiza SVG -> PNG transparente (1024x1280) usando o Chromium do Playwright.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function renderAll(jobs, scale = 2) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 512, height: 640 }, deviceScaleFactor: scale });
  for (const { svg, out } of jobs) {
    await page.setContent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`);
    await page.screenshot({ path: out, omitBackground: true, clip: { x: 0, y: 0, width: 512, height: 640 } });
  }
  await browser.close();
}
module.exports = { renderAll };

if (require.main === module) {
  const [svgPath, out] = process.argv.slice(2);
  renderAll([{ svg: fs.readFileSync(svgPath, 'utf8'), out }]).then(() => console.log('ok', out));
}
