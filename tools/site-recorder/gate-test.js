// Focused gate test for a story-3d-site build: for EVERY gate —
// can it be scrolled past? does holding work? what is on screen right after
// the cinematic WITHOUT any further scrolling (catches "stuck on black")?
// Usage: node gate-test.js <outDir> [url]
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// Solve an optional "draw a circle" intro with real mouse input.
async function solveIntro(page, W, H, shot) {
  // notification-wall intro: swipe across the screen until it clears
  if (await page.$('.nwall')) {
    await new Promise((res) => setTimeout(res, 900));
    if (shot) await shot('intro-wall');
    for (let pass = 0; pass < 24 && (await page.$(".nwall")); pass++) {
      const y = H * (0.06 + (pass % 12) * 0.075);
      const [x0, x1] = pass % 2 ? [W * 0.95, W * 0.05] : [W * 0.05, W * 0.95];
      await page.mouse.move(x0, y);
      await page.mouse.down();
      for (let i = 1; i <= 24; i++) { await page.mouse.move(x0 + ((x1 - x0) * i) / 24, y + Math.sin(i / 3) * 40); await new Promise((res) => setTimeout(res, 10)); }
      await page.mouse.up();
      if (shot && pass === 2) await shot('intro-swiping');
      await new Promise((res) => setTimeout(res, 120));
    }
    await page.waitForFunction(() => !document.querySelector('.nwall'), { timeout: 8000 });
    return true;
  }
  const drawSel = (await page.$('.frost-intro')) ? '.frost-intro' : (await page.$('.intro')) ? '.intro' : null;
  if (!drawSel) return false;
  await new Promise((res) => setTimeout(res, 1200)); // let the intro mount its listeners
  if (shot) await shot('intro');
  const cx = W / 2, cy = H / 2, r = Math.min(W, H) * 0.2;
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.mouse.move(cx + r, cy);
    await page.mouse.down();
    for (let i = 0; i <= 60; i++) {
      const a = (i / 60) * Math.PI * 2.05;
      await page.mouse.move(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      await new Promise((res) => setTimeout(res, 12));
    }
    await page.mouse.up();
    const closed = await page.waitForFunction((sel) => !document.querySelector(sel), { timeout: 4000 }, drawSel).then(() => true, () => false);
    if (closed) return true;
  }
  throw new Error('intro circle was not recognised after 3 attempts');
}

const OUT = process.argv[2] || './gate';
const URL = process.argv[3] || 'http://localhost:3100';
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await puppeteer.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', headless: true, defaultViewport: { width: 1280, height: 760 }, args: ['--ignore-gpu-blocklist'] });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.loader.is-gone', { timeout: 60000 });
  await sleep(800);
  console.log('intro solved:', await solveIntro(page, 1280, 760));
  await sleep(900);
  const state = () => page.evaluate(() => ({ y: Math.round(scrollY), gate: !!document.querySelector('.gate-btn'), label: document.querySelector('.ruler-label')?.textContent }));
  // average brightness of the canvas area (0..255) — detects black/white stalls
  // measured on a real screenshot: reading a WebGL canvas directly returns black
  // (no preserveDrawingBuffer), which would report every frame as "stuck on black"
  const brightness = async () => {
    const b64 = await page.screenshot({ encoding: 'base64', type: 'jpeg', quality: 40 });
    return page.evaluate(async (src) => {
      const img = new Image(); img.src = 'data:image/jpeg;base64,' + src; await img.decode();
      const t = document.createElement('canvas'); t.width = 32; t.height = 18;
      const g = t.getContext('2d'); g.drawImage(img, 0, 0, 32, 18);
      const d = g.getImageData(0, 0, 32, 18).data; let s = 0;
      for (let i = 0; i < d.length; i += 4) s += (d[i] + d[i + 1] + d[i + 2]) / 3;
      return Math.round(s / (d.length / 4));
    }, b64);
  };

  for (let gate = 1; gate <= 5; gate++) {
    // blast forward until a gate appears (or the end)
    let found = false;
    for (let i = 0; i < 120 && !found; i++) {
      await page.mouse.wheel({ deltaY: 400 });
      await sleep(40);
      found = !!(await page.$('.gate-btn'));
    }
    if (!found) { console.log(`no more gates (end at ${JSON.stringify(await state())})`); break; }
    await sleep(800);
    for (let i = 0; i < 20; i++) { await page.mouse.wheel({ deltaY: 400 }); await sleep(20); }
    await page.keyboard.press('End');
    await sleep(500);
    const s1 = await state();
    console.log(`gate ${gate}: held position after scroll attempts: ${JSON.stringify(s1)} ${s1.gate ? 'OK' : 'LEAK!'}`);
    await page.screenshot({ path: `${OUT}/g${gate}-0-visible.png` });

    const b = await (await page.$('.gate-btn')).boundingBox();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
    await page.mouse.down();
    await sleep(2300);
    await page.mouse.up();
    // no scrolling from here: the cinematic must end on a readable screen
    for (let i = 1; i <= 6; i++) {
      await sleep(700);
      await page.screenshot({ path: `${OUT}/g${gate}-${i}-after.png` });
      console.log(`  +${(i * 0.7).toFixed(1)}s  brightness=${await brightness()}  ${JSON.stringify(await state())}`);
    }
  }
  console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no page errors');
  await browser.close();
})().catch((e) => { console.error('FAILED', e.message); process.exit(1); });
