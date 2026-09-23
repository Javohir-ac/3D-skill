// Focused test: can the first gate be scrolled past? Does holding it work?
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const OUT = process.argv[2] || './gate';
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: true, defaultViewport: { width: 1280, height: 760 }, args: ['--ignore-gpu-blocklist'] });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await page.goto('http://localhost:3100', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.loader.is-gone', { timeout: 60000 });
  await sleep(500);
  const state = () => page.evaluate(() => ({ y: Math.round(scrollY), gate: !!document.querySelector('.gate-btn'), label: document.querySelector('.ruler-label')?.textContent }));

  // 1) aggressive fast scrolling — try to blast past the gate
  for (let i = 0; i < 60; i++) { await page.mouse.wheel({ deltaY: 400 }); await sleep(20); }
  await sleep(1500);
  console.log('after fast scroll:', JSON.stringify(await state()));
  await page.screenshot({ path: `${OUT}/1-gate.png` });

  // 2) keep scrolling while gate is open
  for (let i = 0; i < 20; i++) { await page.mouse.wheel({ deltaY: 400 }); await sleep(20); }
  await page.keyboard.press('PageDown'); await page.keyboard.press('End');
  await sleep(800);
  console.log('scroll while gate open:', JSON.stringify(await state()));

  // 3) hold the gate
  const btn = await page.$('.gate-btn');
  if (!btn) { console.log('NO GATE BUTTON'); } else {
    const b = await btn.boundingBox();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
    await page.mouse.down();
    for (let i = 0; i < 8; i++) { await sleep(250); if (i === 3) await page.screenshot({ path: `${OUT}/2-holding.png` }); }
    await page.mouse.up();
    console.log('after hold 2s:', JSON.stringify(await state()));
    for (let i = 0; i < 6; i++) { await sleep(600); await page.screenshot({ path: `${OUT}/3-transition-${i}.png` }); }
    console.log('after transition:', JSON.stringify(await state()));
  }
  console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no page errors');
  await browser.close();
})().catch((e) => { console.error('FAILED', e.message); process.exit(1); });
