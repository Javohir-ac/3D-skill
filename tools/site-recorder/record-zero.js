// Records a full playthrough of why.zero.university to disk:
//   out/zero.webm        — canvas video (MediaRecorder)
//   out/marks.json       — timestamps (seconds in the video) of every action
//   out/shots/*.jpg      — full-page screenshots incl. HTML overlays
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const OUT = path.resolve(process.argv[2] || './out');
fs.mkdirSync(path.join(OUT, 'shots'), { recursive: true });
const W = 1440, H = 810;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    defaultViewport: { width: W, height: H },
    args: ['--ignore-gpu-blocklist', '--enable-gpu', '--autoplay-policy=no-user-gesture-required', `--window-size=${W},${H}`],
  });
  const page = await browser.newPage();
  const marks = [];
  let shotN = 0;

  const vt = () => page.evaluate(() => (window.__recT0 ? (performance.now() - window.__recT0) / 1000 : -1));
  const mark = async (label) => {
    const t = await vt();
    marks.push({ t: +t.toFixed(2), label });
    console.log(`[${t.toFixed(2)}s] ${label}`);
    fs.writeFileSync(path.join(OUT, 'marks.json'), JSON.stringify(marks, null, 2));
  };
  const shot = async (label) => {
    const t = await vt();
    const name = `${String(shotN++).padStart(3, '0')}_${t.toFixed(1)}s_${label}.jpg`;
    await page.screenshot({ path: path.join(OUT, 'shots', name), type: 'jpeg', quality: 75 });
  };
  const holdVisible = () =>
    page.evaluate(() => {
      const el = [...document.querySelectorAll('body *')].find(
        (e) => e.children.length < 3 && /TAP\s*HOLD/.test(e.innerText || '')
      );
      if (!el) return false;
      let o = 1;
      for (let p = el; p && p !== document.documentElement; p = p.parentElement) {
        const s = getComputedStyle(p);
        if (s.display === 'none' || s.visibility === 'hidden') return false;
        o *= parseFloat(s.opacity);
      }
      return o > 0.5;
    });
  const stage = () => page.evaluate(() => {
    try { return JSON.parse(sessionStorage.getItem('zero:resume') || '{}').stage || ''; } catch { return ''; }
  });

  console.log('loading…');
  await page.goto('https://why.zero.university/', { waitUntil: 'domcontentloaded', timeout: 120000 });
  const gl = await page.evaluate(() => {
    const c = document.createElement('canvas').getContext('webgl');
    const d = c && c.getExtension('WEBGL_debug_renderer_info');
    return d ? c.getParameter(d.UNMASKED_RENDERER_WEBGL) : 'no webgl';
  });
  console.log('GPU:', gl);

  // wait for the intro ("DRAW A ZERO") to be ready
  for (let i = 0; i < 90; i++) {
    const ready = await page.evaluate(() => {
      const el = [...document.querySelectorAll('body *')].find((e) => e.children.length < 2 && /DRAW A ZERO/.test(e.innerText || ''));
      if (!el) return false;
      let o = 1;
      for (let p = el; p && p !== document.documentElement; p = p.parentElement) o *= parseFloat(getComputedStyle(p).opacity);
      return o > 0.5;
    });
    if (ready) break;
    await sleep(1000);
  }
  await sleep(2000);

  // start canvas recording
  await page.evaluate(() => {
    const c = [...document.querySelectorAll('canvas')].sort((a, b) => b.width * b.height - a.width * a.height)[0];
    const rec = new MediaRecorder(c.captureStream(30), { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 4e6 });
    window.__chunks = [];
    rec.ondataavailable = (e) => e.data.size && window.__chunks.push(e.data);
    rec.onstop = () => { window.__blob = new Blob(window.__chunks, { type: 'video/webm' }); };
    window.__rec = rec;
    window.__recT0 = performance.now();
    rec.start(1000);
  });
  await mark('recording started (intro: DRAW A ZERO)');
  await shot('intro');

  // draw a zero with real mouse input
  const cx = W / 2, cy = H / 2, r = Math.min(W, H) * 0.2;
  await page.mouse.move(cx, cy - r);
  await page.mouse.down();
  for (let i = 0; i <= 80; i++) {
    const a = -Math.PI / 2 + (i / 80) * 2 * Math.PI * 1.05;
    await page.mouse.move(cx + r * Math.cos(a), cy + r * Math.sin(a));
    await sleep(12);
  }
  await page.mouse.up();
  await mark('zero drawn');
  for (let i = 0; i < 6; i++) { await sleep(700); await shot('after-draw'); }

  // scroll through the story; hold whenever TAP HOLD appears
  let holds = 0, lastStage = '', afterFinal = -1;
  for (let step = 0; step < 900; step++) {
    await page.mouse.move(cx + 200, cy + 150);
    await page.mouse.wheel({ deltaY: 100 });
    await sleep(260);
    if (step % 6 === 0) await shot(`scroll${step}`);

    const st = await stage();
    if (st !== lastStage) { await mark(`stage -> ${st}`); lastStage = st; }

    if (step % 3 === 0 && (await holdVisible())) {
      holds++;
      await sleep(800);
      await mark(`TAP HOLD #${holds} visible`);
      await shot(`hold${holds}-visible`);
      await page.mouse.move(cx, cy);
      await page.mouse.down();
      await mark(`hold #${holds} pressed`);
      for (let i = 0; i < 24; i++) {           // ~12 s pressed, screenshots every 0.5 s
        await sleep(500);
        await page.mouse.move(cx + (i % 2), cy);
        await shot(`hold${holds}-pressing`);
      }
      await page.mouse.up();
      await mark(`hold #${holds} released`);
      for (let i = 0; i < 8; i++) { await sleep(600); await shot(`hold${holds}-after`); }
    }

    if (/5/.test(st) && afterFinal < 0) afterFinal = step;
    if (afterFinal >= 0 && step - afterFinal > 60) break;
  }
  await mark('final reached');
  for (let i = 0; i < 5; i++) { await sleep(1000); await shot('final'); }

  // stop and save video
  await page.evaluate(() => new Promise((r) => { window.__rec.onstop = () => { window.__blob = new Blob(window.__chunks, { type: 'video/webm' }); r(); }; window.__rec.stop(); }));
  const size = await page.evaluate(() => window.__blob.size);
  const fd = fs.openSync(path.join(OUT, 'zero.webm'), 'w');
  const CH = 4 * 1024 * 1024;
  for (let off = 0; off < size; off += CH) {
    const b64 = await page.evaluate(async (o, n) => {
      const buf = new Uint8Array(await window.__blob.slice(o, o + n).arrayBuffer());
      let s = ''; for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
      return btoa(s);
    }, off, CH);
    fs.writeSync(fd, Buffer.from(b64, 'base64'));
  }
  fs.closeSync(fd);
  await mark(`video saved (${(size / 1e6).toFixed(1)} MB)`);
  await browser.close();
})().catch((e) => { console.error('FAILED', e); process.exit(1); });
