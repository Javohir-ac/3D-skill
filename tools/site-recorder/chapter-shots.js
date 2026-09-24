// Screenshots of one chapter: node chapter-shots.js <chapterId> <outDir> [steps] [wheelDelta] [gatesToPass] [url]
// Skips the intro, passes N TAP HOLD gates, scrolls to the chapter, then shoots a frame per wheel step.
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const [id = 'break', out = 'chap', steps = '12', delta = '160', gates = '0', url = 'http://localhost:3100'] = process.argv.slice(2);
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out);
(async () => {
  const b = await puppeteer.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', headless: true, defaultViewport: { width: 1440, height: 810 }, args: ['--ignore-gpu-blocklist'] });
  const page = await b.newPage();
  page.on('pageerror', (e) => console.log('PAGEERR', e.message));
  page.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE', m.text()); });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.frost-skip, .intro-skip, .nw-silence', { timeout: 90000 });
  await sleep(800);
  await page.click('.frost-skip, .intro-skip, .nw-silence');
  await sleep(1200);
  await page.mouse.move(900, 650);
  for (let g = 0; g < +gates; g++) {
    for (let i = 0; i < 200 && !(await page.$('.gate-btn')); i++) { await page.mouse.wheel({ deltaY: 400 }); await sleep(25); }
    const bb = await (await page.$('.gate-btn')).boundingBox();
    await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await page.mouse.down(); await sleep(2300); await page.mouse.up();
    await sleep(4500);
    await page.mouse.move(900, 650);
  }
  const top = await page.evaluate((i) => document.getElementById(i).offsetTop, id);
  for (let k = 0; k < 200; k++) { const y = await page.evaluate(() => scrollY); if (y >= top - 5) break; await page.mouse.wheel({ deltaY: Math.min(400, top - y) }); await sleep(30); }
  await sleep(1200);
  for (let i = 0; i < +steps; i++) {
    await page.screenshot({ path: `${out}/${String(i).padStart(2, '0')}.jpg`, type: 'jpeg', quality: 78 });
    if (await page.$('.gate-btn')) break;
    await page.mouse.wheel({ deltaY: +delta });
    await sleep(700);
  }
  await b.close();
})();
