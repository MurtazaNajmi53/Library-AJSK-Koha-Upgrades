const { chromium, devices } = require('playwright');
const BASE = process.argv[2] || 'http://127.0.0.1:8801';

const pass = [], fail = [];
const check = (n, ok, d) => (ok ? pass : fail).push(n + (d ? '  — ' + d : ''));

const WIDTHS = [
  { label: 'desktop 1920', w: 1920, h: 1080, expect: 'three' },
  { label: 'laptop 1440',  w: 1440, h: 900,  expect: 'three' },
  { label: 'laptop 1280',  w: 1280, h: 800,  expect: 'three' },
  { label: 'small 1100',   w: 1100, h: 800,  expect: 'three' },
  { label: 'ipad land 1024', w: 1024, h: 768, expect: 'three' },
  { label: 'ipad port 834', w: 834,  h: 1112, expect: 'tworow' },
  { label: 'tablet 768',   w: 768,  h: 1024, expect: 'tworow' },
  { label: 'phone 390',    w: 390,  h: 844,  expect: 'stack' },
];

(async () => {
  const browser = await chromium.launch(process.env.CHROME_PATH
    ? { executablePath: process.env.CHROME_PATH, args: ['--no-sandbox'] }
    : { args: ['--no-sandbox'] });

  console.log('width          home px  |  new books   account     news    | share of row      order');
  console.log('-'.repeat(104));

  for (const v of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width: v.w, height: v.h } });
    const page = await ctx.newPage();
    await page.goto(BASE + '/home');
    await page.waitForSelector('.aj-shelf__item', { timeout: 25000 });
    await page.waitForSelector('.aj-news__item', { timeout: 25000 });
    await page.waitForTimeout(350);

    const m = await page.evaluate(() => {
      const g = id => { const r = document.getElementById(id).getBoundingClientRect();
        return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
      const home = document.getElementById('aj-home').getBoundingClientRect();
      const main = document.getElementById('aj-home').closest('[class*="col"]');
      const row = main.parentElement;
      const right = [...row.children].find(c => /col-lg-3/.test(c.className));
      return {
        homeW: Math.round(home.width),
        rowW: Math.round(row.getBoundingClientRect().width),
        mainW: Math.round(main.getBoundingClientRect().width),
        rightHidden: right ? getComputedStyle(right).display === 'none' : null,
        nb: g('aj-new-books'), ml: g('aj-my-library'), nw: g('aj-news'),
        coverW: getComputedStyle(document.querySelector('.aj-home > .aj-new'))
                  .getPropertyValue('--aj-cover-w').trim(),
        coversVisible: (() => {
          const track = document.querySelector('.aj-shelf__track');
          if (!track) return 0;
          const tw = track.clientWidth;
          const item = document.querySelector('.aj-shelf__item');
          const iw = item ? item.getBoundingClientRect().width + 16 : 1;
          return Math.floor(tw / iw);
        })(),
        overflow: document.documentElement.scrollWidth - window.innerWidth,
      };
    });

    const order = [['new books', m.nb], ['account', m.ml], ['news', m.nw]]
      .sort((a, b) => (a[1].y - b[1].y) || (a[1].x - b[1].x)).map(o => o[0]).join(' → ');
    const rows = new Set([m.nb.y, m.ml.y, m.nw.y]).size;
    const shape = rows === 1 ? 'three' : (rows === 2 ? 'tworow' : 'stack');
    const pct = x => (100 * x / m.homeW).toFixed(0) + '%';

    console.log(
      `${v.label.padEnd(14)} ${String(m.homeW).padStart(5)}    |` +
      ` ${String(m.nb.w).padStart(8)} ${String(m.ml.w).padStart(8)} ${String(m.nw.w).padStart(8)}   |` +
      ` ${(pct(m.nb.w)+'/'+pct(m.ml.w)+'/'+pct(m.nw.w)).padEnd(15)} ${order}`);

    check(`${v.label}: layout shape is ${v.expect}`, shape === v.expect, shape);
    check(`${v.label}: no sideways overflow`, m.overflow <= 1, String(m.overflow));

    if (v.w >= 992) {
      check(`${v.label}: empty Koha column is hidden`, m.rightHidden === true);
      check(`${v.label}: widgets use the full row`,
        Math.abs(m.homeW - m.rowW) < 30, `home ${m.homeW} vs row ${m.rowW}`);
    }
    if (v.expect === 'three') {
      check(`${v.label}: order is books, account, news`,
        order === 'new books → account → news', order);
      check(`${v.label}: all three tops align`, m.nb.y === m.ml.y && m.ml.y === m.nw.y);
      check(`${v.label}: all three heights match`, m.nb.h === m.ml.h && m.ml.h === m.nw.h,
        `${m.nb.h}/${m.ml.h}/${m.nw.h}`);
      check(`${v.label}: account and news are equal`, Math.abs(m.ml.w - m.nw.w) <= 1,
        `${m.ml.w} vs ${m.nw.w}`);
      check(`${v.label}: neither side column below 240px`, Math.min(m.ml.w, m.nw.w) >= 240,
        `${Math.min(m.ml.w, m.nw.w)}px`);
    }
    if (v.w >= 1200) {
      const share = m.nb.w / m.homeW;
      check(`${v.label}: shelf takes about half`, share > 0.45 && share < 0.53,
        (share * 100).toFixed(1) + '%');
    }
    if (v.expect === 'tworow') {
      check(`${v.label}: account leads`, order.startsWith('account'), order);
      check(`${v.label}: shelf spans the full width`,
        Math.abs(m.nb.w - m.homeW) < 3, `${m.nb.w} of ${m.homeW}`);
      check(`${v.label}: account and news share the top row`,
        m.ml.y === m.nw.y && Math.abs(m.ml.w - m.nw.w) <= 1);
    }
    if (v.expect === 'stack') {
      check(`${v.label}: account first`, order.startsWith('account'), order);
      check(`${v.label}: every widget full width`,
        [m.nb, m.ml, m.nw].every(b => Math.abs(b.w - m.homeW) < 3));
    }

    await page.screenshot({ path: `shots/layout-${v.w}.png`, fullPage: v.w < 992 });
    await ctx.close();
  }

  await browser.close();
  console.log('\n' + '='.repeat(60));
  pass.forEach(p => console.log('  PASS  ' + p));
  fail.forEach(f => console.log('  FAIL  ' + f));
  console.log(`\n  ${pass.length} passed, ${fail.length} failed`);
  process.exit(fail.length ? 1 : 0);
})();
