// Automated visual QA for a story-3d-site build.
// Usage: node walkthrough.js <url> <outDir> [width] [height]
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const [url = 'http://localhost:3100', outDir = './qa', W = '1440', H = '810'] = process.argv.slice(2);
const OUT = path.resolve(outDir);
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME || '/usr/bin/google-chrome',
    headless: true,
    defaultViewport: { width: +W, height: +H, isMobile: +W < 700, hasTouch: +W < 700 },
    args: ['--ignore-gpu-blocklist', '--enable-gpu'],
  });
  const page = await browser.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`[${m.type()}] ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));

  let n = 0;
  const shot = async (label) => {
    const name = `${String(n++).padStart(3, '0')}_${label}.jpg`;
    await page.screenshot({ path: path.join(OUT, name), type: 'jpeg', quality: 72 });
    return name;
  };
  const t0 = Date.now();
  const log = (s) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s] ${s}`);

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await shot('loader');
  await page.waitForSelector('.loader.is-gone', { timeout: 60000 });
  log(`loader gone after ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  await sleep(800);
  await shot('start');

  const cx = +W / 2, cy = +H / 2;
  let gates = 0;
  for (let step = 0; step < 700; step++) {
    await page.mouse.move(cx + 120, cy + 80);
    await page.mouse.wheel({ deltaY: 110 });
    await sleep(140);
    if (step % 5 === 0) {
      const title = await page.$eval('.ruler-label', (e) => e.textContent).catch(() => '?');
      await shot(`s${step}_${title.replace(/\W+/g, '-')}`);
    }
    const gate = await page.$('.gate-btn');
    if (gate) {
      gates++;
      await sleep(700);
      log(`gate #${gates} visible`);
      await shot(`gate${gates}-visible`);
      const box = await gate.boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      const until = Date.now() + 7500;
      let released = false;
      while (Date.now() < until) {
        await shot(`gate${gates}-t${((Date.now() - t0) / 1000).toFixed(2)}`);
        if (!released && !(await page.$('.gate-btn'))) { await page.mouse.up(); released = true; log(`gate #${gates} completed`); }
        await sleep(90);
      }
      if (!released) await page.mouse.up();
    }
    const done = await page.$eval('.ruler-label', (e) => e.textContent).catch(() => '');
    if (done === 'Explore') {
      await sleep(2500);
      await shot('finale');
      const hs = await page.$('.hotspot');
      if (hs) { await hs.click(); await sleep(700); await shot('finale-card'); }
      break;
    }
  }
  log(`done, ${n} shots, ${gates} gates`);
  fs.writeFileSync(path.join(OUT, 'console.txt'), errors.join('\n') || '(no errors/warnings)');
  console.log(errors.length ? `CONSOLE:\n${errors.slice(0, 20).join('\n')}` : 'console clean');
  await browser.close();
})().catch((e) => { console.error('FAILED', e); process.exit(1); });
