const { chromium, devices } = require('playwright');

const V3 = 'http://127.0.0.1:8801';
const V2 = 'http://127.0.0.1:8802';   // v3, to prove the regression
const V5 = 'http://127.0.0.1:8806';   // v4, patron with an empty account
const V1 = 'http://127.0.0.1:8807';   // the original v1.2, for the rosette comparison
const V4 = 'http://127.0.0.1:8804';   // same as V3, but Zebra refuses the CCL term

const pass = [], fail = [];
function check(name, ok, detail) {
  (ok ? pass : fail).push(name + (detail ? '  — ' + detail : ''));
}

async function widgetTiming(browser, base, label) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(base + '/__reset');
  const t0 = Date.now();
  await page.goto(base + '/home', { waitUntil: 'domcontentloaded' });

  // All four watched at once: measured one after another, each figure
  // would just inherit the slowest one before it.
  const watch = sel => page.waitForSelector(sel, { timeout: 25000 })
    .then(() => Date.now() - t0).catch(() => null);
  const [account, books, news, yearCount] = await Promise.all([
    watch('.aj-ml__status, .aj-ml__row'),
    watch('.aj-shelf__item'),
    watch('.aj-news__item'),
    watch('.aj-ml__num'),
  ]);
  const marks = { account, books, news, yearCount };
  marks.allDone = Math.max(...Object.values(marks).filter(v => v != null));

  const hits = await page.evaluate(b => fetch(b + '/__hits').then(r => r.json()), base);
  await ctx.close();
  return { label, marks, hits };
}

(async () => {
  const browser = await chromium.launch(process.env.CHROME_PATH
    ? { executablePath: process.env.CHROME_PATH, args: ['--no-sandbox'] }
    : { args: ['--no-sandbox'] });

  /* ---------- 1. Speed: v3 against the currently installed v1.2 ---------- */
  const oldRun = await widgetTiming(browser, V2, 'v3 (broken)');
  const newRun = await widgetTiming(browser, V3, 'v3');

  console.log('\n=== LOAD TIMING (ms from navigation) ===');
  for (const r of [oldRun, newRun]) {
    console.log(`\n${r.label}:`);
    console.log(`  account card visible : ${r.marks.account}`);
    console.log(`  new books visible    : ${r.marks.books}`);
    console.log(`  news widget visible  : ${r.marks.news}`);
    console.log(`  yearly count filled  : ${r.marks.yearCount}`);
    console.log(`  everything settled   : ${r.marks.allDone}`);
    console.log(`  requests             : ${r.hits.map(h => h[1].split('/').pop() + '@' + h[0]).join(', ')}`);
  }

  check('v4 draws the account card at all',
    newRun.marks.account !== null, `${newRun.marks.account}ms`);
  check('v4 draws the new-books shelf at all',
    newRun.marks.books !== null, `${newRun.marks.books}ms`);
  check('news widget needs no request at all',
    newRun.marks.news !== null && newRun.marks.news < 1500,
    `${newRun.marks.news}ms`);

  /* ---------- 1a. THE REGRESSION ----------
     Koha inlines OPACUserJS into every OPAC page, so every page the
     script fetches contains the script's own source. v3 sniffed for the
     login screen by searching that raw HTML for id="opac-auth" — a
     string sitting in its own isLoginPage(). Always true. Both widgets
     reported a dead session while the reader was logged in.

     This must FAIL on v3 and PASS on v4, or it is not testing anything. */
  {
    async function widgets(base, label) {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
      const page = await ctx.newPage();
      await page.goto(base + '/home');
      await page.waitForTimeout(6000);
      const r = await page.evaluate(async () => {
        // Ask the running script directly, on a real logged-in account page
        const h = await fetch('/cgi-bin/koha/opac-user.pl', { credentials: 'same-origin' })
          .then(x => x.text());
        return {
          accountText: (document.getElementById('aj-my-library') || {}).innerText || '',
          booksText: (document.getElementById('aj-new-books') || {}).innerText || '',
          covers: document.querySelectorAll('.aj-shelf__item').length,
          rows: document.querySelectorAll('.aj-ml__row').length,
          sniffOnRealAccountPage: window.ajOpac.isLoginPage(h),
        };
      });
      await ctx.close();
      console.log(`\n=== ${label} ===`);
      console.log('  isLoginPage(account page) :', r.sniffOnRealAccountPage, '   <- must be false');
      console.log('  account card rows         :', r.rows);
      console.log('  shelf covers              :', r.covers);
      console.log('  account card says         :', r.accountText.replace(/\n/g,' | ').slice(0,90));
      console.log('  shelf says                :', r.booksText.replace(/\n/g,' | ').slice(0,90));
      return r;
    }

    const bad = await widgets(V2, 'v3 — the version now installed');
    const good = await widgets(V3, 'v4 — with the fix');

    check('v3 really is broken (isLoginPage true on a logged-in page)',
      bad.sniffOnRealAccountPage === true, 'reproduced');
    check('v3 really does show the session error',
      /session has ended/i.test(bad.accountText) && /could not be loaded/i.test(bad.booksText),
      'reproduced');
    check('v4: isLoginPage is false on a logged-in account page',
      good.sniffOnRealAccountPage === false);
    check('v4: the account card shows real rows',
      good.rows >= 5, `${good.rows} rows`);
    check('v4: the shelf shows real covers',
      good.covers > 0, `${good.covers} covers`);
    check('v4: no session error anywhere',
      !/session has ended|could not be loaded/i.test(good.accountText + good.booksText));
  }

  /* ---------- 1c. The login page must still be detected ---------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(V3 + '/home');
    await page.waitForTimeout(1500);
    const r = await page.evaluate(async () => {
      const login = await fetch('/login-page-raw').then(x => x.text());
      const acct  = await fetch('/cgi-bin/koha/opac-user.pl', {credentials:'same-origin'}).then(x=>x.text());
      return {
        login: window.ajOpac.isLoginPage(login),
        loginBodyId: window.ajOpac.bodyId(login),
        account: window.ajOpac.isLoginPage(acct),
        accountBodyId: window.ajOpac.bodyId(acct),
      };
    });
    console.log('\n=== LOGIN SNIFF ===');
    console.log(' ', JSON.stringify(r));
    check('a real login page IS detected', r.login === true, r.loginBodyId);
    check('an account page is NOT detected as login', r.account === false, r.accountBodyId);
    check('body id is read despite Koha writing it uppercase',
      r.loginBodyId === 'opac-login-page' && r.accountBodyId === 'opac-user');
    await ctx.close();
  }

  /* ---------- 1d. A patron with nothing on loan ----------
     Koha renders "Checked out (0)" as a tab label and NO table at all,
     so counting table rows cannot tell "none" from "not rendered". */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(V5 + '/home');
    await page.waitForSelector('.aj-ml__row', { timeout: 25000 });
    await page.waitForTimeout(500);
    const r = await page.evaluate(() => ({
      text: document.getElementById('aj-my-library').innerText.replace(/\n/g,' | '),
      rows: document.querySelectorAll('.aj-ml__row').length,
      err: /session has ended|could not be loaded/i.test(document.getElementById('aj-my-library').innerText)
    }));
    console.log('\n=== EMPTY ACCOUNT ===');
    console.log('  ', r.text.slice(0, 150));
    check('an empty account still renders its card', r.rows >= 5 && !r.err, `${r.rows} rows`);
    await ctx.close();
  }

  /* ---------- 1b. The second visit (warm cache) ---------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(V3 + '/home');                       // first visit: fills the cache
    await page.waitForSelector('.aj-shelf__item', { timeout: 25000 });
    await page.goto(V3 + '/__reset');
    const t0 = Date.now();
    await page.goto(V3 + '/home', { waitUntil: 'domcontentloaded' });
    const books = await page.waitForSelector('.aj-shelf__item', { timeout: 25000 })
      .then(() => Date.now() - t0);
    const hits = await page.evaluate(b => fetch(b + '/__hits').then(r => r.json()), V3);
    const searched = hits.some(h => h[1].includes('opac-search'));
    console.log('\n=== SECOND VISIT, SAME BROWSER ===');
    console.log(`  new books visible : ${books}ms`);
    console.log(`  search request    : ${searched ? 'sent again' : 'not needed (served from cache)'}`);
    check('second visit skips the search request entirely', !searched);
    check('second visit shows the new books almost at once', books < 600, `${books}ms`);
    await ctx.close();
  }

  /* ---------- 2. Home page: layout, order, alignment ---------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await ctx.newPage();
    await page.goto(V3 + '/home');
    await page.waitForSelector('.aj-shelf__item', { timeout: 20000 });
    await page.waitForSelector('.aj-news__item', { timeout: 20000 });
    await page.waitForTimeout(400);

    const boxes = await page.evaluate(() => {
      const g = id => { const e = document.getElementById(id); const r = e.getBoundingClientRect();
        return { id, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
      return ['aj-new-books', 'aj-my-library', 'aj-news'].map(g);
    });
    console.log('\n=== WIDGET GEOMETRY (1440px) ===');
    boxes.forEach(b => console.log(`  ${b.id.padEnd(16)} x=${String(b.x).padStart(5)} y=${String(b.y).padStart(4)} w=${String(b.w).padStart(4)} h=${b.h}`));

    const [nb, ml, nw] = boxes;
    check('left-to-right order is new books, account, news',
      nb.x < ml.x && ml.x < nw.x, `${nb.x} < ${ml.x} < ${nw.x}`);
    check('all three tops align', new Set(boxes.map(b => b.y)).size === 1,
      boxes.map(b => b.y).join('/'));
    check('all three heights align', new Set(boxes.map(b => b.h)).size === 1,
      boxes.map(b => b.h).join('/'));

    const newsHidden = await page.evaluate(() =>
      getComputedStyle(document.getElementById('news')).display);
    check("Koha's own news block is hidden", newsHidden === 'none', newsHidden);

    const newsCount = await page.locator('.aj-news__item').count();
    check('all three news items moved across', newsCount === 3, String(newsCount));
    const newsHasTable = await page.locator('.aj-news__body table').count();
    check('news formatting (a timings table) survives the move', newsHasTable === 1);

    await page.screenshot({ path: 'shots/home-desktop.png', fullPage: false });
    await ctx.close();
  }

  /* ---------- 3. In-Stock filtering ---------- */
  {
    const truth = require('./fixtures/truth.json');
    const norm = s => s.replace(/\s*\/$/, '');

    async function shelf(base, label) {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
      const page = await ctx.newPage();
      const searches = [];
      page.on('request', r => { if (r.url().includes('opac-search')) searches.push(decodeURIComponent(r.url())); });
      await page.goto(base + '/home');
      await page.waitForSelector('.aj-shelf__item', { timeout: 25000 });
      const shown = (await page.evaluate(() =>
        [...document.querySelectorAll('.aj-shelf__cover')].map(c => c.getAttribute('data-title'))))
        .map(norm);
      const hooks = await page.evaluate(() => window.ajShelvesTest && {
        byCode: window.ajShelvesTest.byCode, url: window.ajShelvesTest.searchUrl });
      await ctx.close();
      console.log(`\n=== NEW BOOKS SHELF — ${label} ===`);
      console.log('  query    :', decodeURIComponent(hooks.url));
      console.log('  requests :', searches.length, searches.some(s => s.includes('notforloan=3')) ? '(code-based)' : '');
      console.log('  shown    :', shown.length);
      shown.forEach(s => console.log('   -', s));
      return { shown, hooks, searches };
    }

    // (a) normal: Zebra honours "not notforloan=3"
    const a = await shelf(V3, 'code 3 excluded by Zebra');
    check('the search asks Zebra to exclude notforloan=3',
      a.hooks.byCode && a.searches[0].includes('not notforloan=3'), a.searches[0]);
    check('only one search request is made', a.searches.length === 1, String(a.searches.length));
    check('no In-Stock-only title reaches the shelf',
      truth.instockOnly.every(t => !a.shown.includes(t)),
      `all ${truth.instockOnly.length} hidden`);
    check('any-copy mode also drops titles with a mixed holding',
      truth.mixed.every(t => !a.shown.includes(t)),
      'record-level index, as documented');
    check('every freely loanable title that fits is shown',
      a.shown.every(t => truth.available.includes(t)),
      `${a.shown.length} shown, all loanable`);
    check('the code-based query fetches a smaller page',
      /count=16(&|$)/.test(a.hooks.url), a.hooks.url.split('&').pop());

    // (b) the safety net: a Zebra that does not understand the term
    const b = await shelf(V4, 'fallback — Zebra refuses the term');
    check('the shelf falls back instead of going blank', b.shown.length > 0,
      `${b.shown.length} shown`);
    check('the fallback re-runs the plain search', b.searches.length === 2,
      String(b.searches.length));
    check('the fallback still hides In-Stock-only titles',
      truth.instockOnly.every(t => !b.shown.includes(t)));
    check('the fallback keeps titles with one loanable copy',
      truth.mixed.every(t => b.shown.includes(t)), 'both kept');
  }

  /* ---------- 4. The rosette: mobile ---------- */
  {
    const ctx = await browser.newContext({ ...devices['iPhone 13'] });
    const page = await ctx.newPage();
    await page.goto(V3 + '/home');
    await page.waitForTimeout(600);

    const res = await page.evaluate(async () => {
      window.ajOpac.loader.start();
      // v5: the rosette joins the progress bar after 1.2s, then fades in
      await new Promise(r => setTimeout(r, 1700));
      const el = document.getElementById('aj-loader');
      const r = el.getBoundingClientRect();
      const mark = document.querySelector('.aj-loader__mark, .aj-loader-mark').getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        visible: cs.visibility === 'visible' && +cs.opacity > 0.5,
        onScreen: mark.x >= 0 && mark.y >= 0 &&
                  mark.x + mark.width <= innerWidth + 1 &&
                  mark.y + mark.height <= innerHeight + 1,
        centred: Math.abs((mark.x + mark.width / 2) - innerWidth / 2) < 3,
        overlay: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        viewport: { w: innerWidth, h: innerHeight },
        docWidth: document.documentElement.scrollWidth
      };
    });
    console.log('\n=== ROSETTE ON A PHONE (iPhone 13) ===');
    console.log(' ', JSON.stringify(res));
    check('rosette becomes visible on a phone', res.visible);
    check('rosette is inside the visible area on a phone', res.onScreen);
    check('rosette is horizontally centred on a phone', res.centred);
    check('home page has no sideways overflow on a phone',
      res.docWidth <= res.viewport.w + 1, `doc ${res.docWidth} vs viewport ${res.viewport.w}`);

    await page.screenshot({ path: 'shots/home-mobile.png', fullPage: false });
    await ctx.close();
  }

  /* ---------- 4b. The actual fault: a pinch-zoomed phone ----------
     A plain phone viewport never reproduced the problem, because the
     layout and visual viewports are the same size. The fault appears
     once they diverge — which is what pinch-zoom does. Chromium's
     page-scale emulation reproduces it exactly. */
  {
    async function zoomTest(base, label, drive) {
      const ctx = await browser.newContext({ ...devices['iPhone 13'] });
      const page = await ctx.newPage();
      await page.goto(base + '/home');
      await page.waitForTimeout(500);
      const cdp = await ctx.newCDPSession(page);
      await cdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 3 });
      // Pan away from the top-left, as a reader reading the middle would
      await page.evaluate(() => window.scrollTo(0, 260));
      await cdp.send('Input.dispatchMouseEvent',
        { type: 'mouseWheel', x: 10, y: 10, deltaX: 180, deltaY: 0 });
      await page.waitForTimeout(250);
      await page.evaluate(drive);
      await page.waitForTimeout(1700);
      const r = await page.evaluate(() => {
        const el = document.getElementById('aj-loader');
        if (!el) return { missing: true };
        const m = document.querySelector('.aj-loader__mark, .aj-loader-mark').getBoundingClientRect();
        const vv = window.visualViewport;
        // Where the rosette sits relative to what the reader can see
        const relX = m.x - vv.offsetLeft, relY = m.y - vv.offsetTop;
        return {
          scale: +vv.scale.toFixed(2),
          seen: { w: Math.round(vv.width), h: Math.round(vv.height),
                  offX: Math.round(vv.offsetLeft), offY: Math.round(vv.offsetTop) },
          markRelToView: { x: Math.round(relX), y: Math.round(relY) },
          inside: relX >= -2 && relY >= -2 &&
                  relX + m.width <= vv.width + 2 && relY + m.height <= vv.height + 2
        };
      });
      await ctx.close();
      return { label, r };
    }

    const oldZ = await zoomTest(V1, 'v1.2 (before the rosette fix)',
      () => document.documentElement.classList.add('aj-loading'));
    const newZ = await zoomTest(V3, 'v3',
      () => window.ajOpac.loader.start());

    console.log('\n=== ROSETTE ON A PINCH-ZOOMED PHONE (page scale 3) ===');
    for (const z of [oldZ, newZ]) {
      console.log('  ' + z.label.padEnd(22) + JSON.stringify(z.r));
    }
    check('the original rosette fault still reproduces on v1.2',
      oldZ.r.inside === false, 'rosette lands outside the visible area');
    check('the fix keeps the rosette inside the visible area when zoomed',
      newZ.r.inside === true);
  }

  /* ---------- 5. The old code, same phone, for comparison ---------- */
  {
    const ctx = await browser.newContext({ ...devices['iPhone 13'] });
    const page = await ctx.newPage();
    await page.goto(V2 + '/home');
    await page.waitForTimeout(600);
    const res = await page.evaluate(async () => {
      // v1.2 had no exposed handle; drive it the way a tap would
      document.documentElement.classList.add('aj-loading');
      await new Promise(r => setTimeout(r, 900));
      const el = document.getElementById('aj-loader');
      if (!el) return { missing: true };
      const mark = document.querySelector('.aj-loader__mark, .aj-loader-mark').getBoundingClientRect();
      return {
        onScreen: mark.x >= 0 && mark.x + mark.width <= innerWidth + 1,
        centreOffset: Math.round((mark.x + mark.width / 2) - innerWidth / 2),
        docWidth: document.documentElement.scrollWidth, viewport: innerWidth
      };
    });
    console.log('\n=== ROSETTE ON A PHONE, CURRENTLY INSTALLED CODE ===');
    console.log(' ', JSON.stringify(res));
    await ctx.close();
  }

  /* ---------- 6. Self-checkout kiosk, portrait ---------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, hasTouch: true });
    const page = await ctx.newPage();

    // login screen
    await page.goto(V3 + '/sco/login');
    await page.waitForTimeout(300);
    const mask = await page.evaluate(() => {
      const i = document.getElementById('patronid');
      const cs = getComputedStyle(i);
      return { security: cs.webkitTextSecurity || cs.getPropertyValue('-webkit-text-security'),
               type: i.type, w: Math.round(i.getBoundingClientRect().width),
               h: Math.round(i.getBoundingClientRect().height),
               label: document.querySelector('label[for=patronid]').textContent.trim() };
    });
    console.log('\n=== SELF-CHECKOUT LOGIN (1080x1920 portrait) ===');
    console.log(' ', JSON.stringify(mask));
    check('ITS number is masked as it is typed',
      mask.security === 'disc' || mask.type === 'password', mask.security || mask.type);
    check('ITS number box is a real touch target', mask.h >= 64 && mask.w > 400,
      `${mask.w}x${mask.h}`);

    await page.fill('#patronid', '30454007');
    await page.screenshot({ path: 'shots/sco-login.png' });

    // logged-in screen
    await page.goto(V3 + '/sco/main');
    await page.waitForTimeout(300);
    const sco = await page.evaluate(() => {
      const t = document.body.innerText;
      const bc = document.getElementById('barcode').getBoundingClientRect();
      const loader = document.querySelector('#aj-loader, .aj-loader, .aj-progress');
      return {
        leaksNumber: /30454007/.test(t),
        greeting: document.querySelector('.alert-info').textContent.trim(),
        caption: document.querySelector('table caption').textContent.replace(/\s+/g, ' ').trim(),
        greetingVisible: getComputedStyle(document.querySelector('.alert-info')).visibility,
        barcode: { w: Math.round(bc.width), h: Math.round(bc.height) },
        loaderPresent: !!loader,
        opacJsStopped: !!(window.ajOpac && window.ajOpac.stop),
        pageWidth: document.documentElement.scrollWidth, viewport: innerWidth,
        focused: document.activeElement && document.activeElement.id
      };
    });
    console.log('\n=== SELF-CHECKOUT, LOGGED IN ===');
    console.log(' ', JSON.stringify(sco, null, 2));
    check('no ITS number anywhere on the kiosk screen', !sco.leaksNumber);
    check('the reader is still greeted by name',
      /Murtaza/.test(sco.greeting) && sco.greetingVisible === 'visible', sco.greeting);
    check('checkouts caption keeps the name, drops the number',
      /Murtaza/.test(sco.caption) && !/\d{5,}/.test(sco.caption), sco.caption);
    check('OPACUserJS stops itself on the kiosk', sco.opacJsStopped);
    check('no page-loading rosette is built on the kiosk', !sco.loaderPresent);
    check('barcode box spans the portrait screen', sco.barcode.w > 600 && sco.barcode.h >= 64,
      `${sco.barcode.w}x${sco.barcode.h}`);
    check('kiosk has no sideways overflow', sco.pageWidth <= sco.viewport + 1,
      `${sco.pageWidth} vs ${sco.viewport}`);
    check('cursor sits in the barcode box ready for the next scan',
      sco.focused === 'barcode', sco.focused);

    await page.screenshot({ path: 'shots/sco-main.png' });
    await ctx.close();
  }

  /* ---------- 7. Login page wording ---------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(V3 + '/login');
    await page.waitForTimeout(300);
    const t = await page.evaluate(() => ({
      text: document.getElementById('nologininstructions').innerText,
      mail: document.querySelector('.aj-help__mail') &&
            document.querySelector('.aj-help__mail').getAttribute('href'),
      label: document.querySelector('label[for=userid]').textContent.trim(),
      btnH: Math.round(document.querySelector('.aj-help__mail').getBoundingClientRect().height)
    }));
    console.log('\n=== LOGIN PAGE HELP PANEL ===');
    console.log(t.text.split('\n').filter(Boolean).map(l => '  ' + l).join('\n'));

    check('old circulation-desk wording is gone',
      !/circulation desk/i.test(t.text) && !/local library/i.test(t.text));
    check('email address is offered', /library_support\.karachi@jameasaifiyah\.edu/.test(t.text));
    check('email link is the Gmail compose URL', /mail\.google\.com/.test(t.mail));
    check('Front Office is named', /Front Office/i.test(t.text));
    check('weekday hours shown', /9:00\s*am\s*–\s*5:00\s*pm/.test(t.text));
    check('Saturday hours shown', /Saturday/.test(t.text) && /1:00\s*pm/.test(t.text));
    check('login label reads ITS Number', /ITS Number/i.test(t.label), t.label);
    check('email button is a 44px tap target', t.btnH >= 44, String(t.btnH));

    await page.screenshot({ path: 'shots/login-desktop.png' });
    await ctx.close();
  }

  /* ---------- 8. Mobile + tablet layout of the three widgets ---------- */
  {
    for (const [name, vp] of [['mobile', { width: 390, height: 844 }],
                              ['tablet', { width: 834, height: 1112 }]]) {
      const ctx = await browser.newContext({ viewport: vp });
      const page = await ctx.newPage();
      await page.goto(V3 + '/home');
      await page.waitForSelector('.aj-news__item', { timeout: 20000 });
      await page.waitForSelector('.aj-shelf__item', { timeout: 20000 });
      await page.waitForTimeout(300);
      // Reading order is row first, then left-to-right within the row
      const order = await page.evaluate(() =>
        ['aj-new-books', 'aj-my-library', 'aj-news']
          .map(id => { const r = document.getElementById(id).getBoundingClientRect();
                       return { id, y: Math.round(r.y), x: Math.round(r.x) }; })
          .sort((a, b) => (a.y - b.y) || (a.x - b.x)).map(o => o.id));
      const ovf = await page.evaluate(() =>
        document.documentElement.scrollWidth - innerWidth);
      console.log(`\n=== ${name.toUpperCase()} (${vp.width}px) stacking order ===`);
      console.log('  ', order.join(' → '), '| sideways overflow:', ovf);
      check(`${name}: account card comes first`, order[0] === 'aj-my-library', order.join(' → '));
      check(`${name}: no sideways overflow`, ovf <= 1, String(ovf));
      await page.screenshot({ path: `shots/home-${name}.png`, fullPage: true });
      await ctx.close();
    }
  }

  /* ---------- 9. Console errors anywhere ---------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const errs = [];
    page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.text()); });
    page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
    for (const p of ['/home', '/login', '/sco/login', '/sco/main']) {
      await page.goto(V3 + p);
      await page.waitForTimeout(1200);
    }
    const real = errs.filter(e => !/favicon|ERR_|net::/.test(e));
    console.log('\n=== CONSOLE ===');
    console.log(real.length ? real.map(e => '  ' + e).join('\n') : '  clean');
    check('no script errors on any page', real.length === 0, real.join(' | '));
    await ctx.close();
  }

  /* ---------- 10. Design system (v5) ----------
     The rules from design-system/README.md that CSS can break: semantic
     tokens present, no top rule on cards, 3px focus, 44px targets, no
     uppercase eyebrow, the two-layer loader. */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await ctx.newPage();
    await page.goto(V3 + '/home');
    await page.waitForSelector('.aj-shelf__item', { timeout: 25000 });
    await page.waitForSelector('.aj-ml__row', { timeout: 25000 });
    await page.waitForTimeout(300);

    const d = await page.evaluate(() => {
      const cs = (sel, pseudo) => { const e = document.querySelector(sel); return e ? getComputedStyle(e, pseudo) : null; };
      const box = sel => { const e = document.querySelector(sel); if (!e) return null;
        const r = e.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; };
      const root = getComputedStyle(document.documentElement);
      const cards = ['#aj-new-books', '#aj-my-library', '#aj-news'].map(s => cs(s).borderTopWidth);
      return {
        tokens: ['--surface-page', '--action', '--focus-ring', '--text-accent', '--size-target']
                  .every(t => root.getPropertyValue(t).trim() !== ''),
        legacyAliases: ['--aj-blue', '--aj-copper-deep', '--aj-white', '--aj-font-ui']
                  .every(t => root.getPropertyValue(t).trim() !== ''),
        cardTops: cards,
        cardRadius: cs('#aj-my-library').borderTopLeftRadius,
        shelfBtn: box('.aj-shelf__btn--next'),
        chevronSvg: !!document.querySelector('.aj-shelf__btn svg.aj-flip'),
        statusRow: box('.aj-ml__link'),
        progressBuilt: !!document.querySelector('.aj-progress .aj-progress__bar'),
        rosetteArt: (document.getElementById('aj-loader') || { style: { getPropertyValue: () => '' } })
                      .style.getPropertyValue('--aj-ros-line').indexOf('data:image/svg+xml') !== -1,
      };
    });

    // Focus ring: tab to the first shelf link
    await page.focus('.aj-shelf__link');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    const focus = await page.evaluate(() => {
      const s = getComputedStyle(document.activeElement);
      return { w: s.outlineWidth, style: s.outlineStyle, off: s.outlineOffset };
    });

    // Loader: the bar starts at once, the rosette waits, then says what is happening
    const loader = await page.evaluate(async () => {
      const bar = document.querySelector('.aj-progress');
      const l = document.getElementById('aj-loader');
      window.ajOpac.loader.start('/cgi-bin/koha/opac-search.pl?q=x');
      await new Promise(r => setTimeout(r, 400));
      const early = { bar: bar.classList.contains('is-active'), rosette: l.classList.contains('is-active') };
      await new Promise(r => setTimeout(r, 1100));
      const late = { rosette: l.classList.contains('is-active'),
                     label: l.querySelector('.aj-loader__label').textContent };
      window.ajOpac.loader.stop();
      return { early, late, stopped: !l.classList.contains('is-active') && !bar.classList.contains('is-active') };
    });
    await ctx.close();

    console.log('\n=== DESIGN SYSTEM ===');
    console.log(' ', JSON.stringify({ ...d, focus, loader }));
    check('semantic tokens are defined', d.tokens);
    check('legacy --aj-* aliases kept for SCOUserCSS and Part E', d.legacyAliases);
    check('home cards have no top rule', d.cardTops.every(w => w === '1px'), d.cardTops.join('/'));
    check('home cards use radius-md', d.cardRadius === '10px', d.cardRadius);
    check('shelf arrows are 44px', d.shelfBtn && d.shelfBtn.w >= 44 && d.shelfBtn.h >= 44,
      d.shelfBtn && `${d.shelfBtn.w}x${d.shelfBtn.h}`);
    check('shelf arrows draw a mirrored SVG chevron', d.chevronSvg);
    check('account card rows are 44px targets', d.statusRow.h >= 44, String(d.statusRow.h));
    check('focus ring is 3px solid with a 2px+ offset',
      focus.w === '3px' && focus.style === 'solid' && parseFloat(focus.off) >= 2, JSON.stringify(focus));
    check('progress bar is built', d.progressBuilt);
    check('rosette artwork is inline SVG from the script', d.rosetteArt);
    check('progress bar starts at once, rosette waits', loader.early.bar && !loader.early.rosette,
      JSON.stringify(loader.early));
    check('rosette appears after the wait and names the task',
      loader.late.rosette && /Searching the catalogue/.test(loader.late.label), loader.late.label);
    check('stop() clears both layers', loader.stopped);

    // Login: no uppercase eyebrow
    const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const p2 = await ctx2.newPage();
    await p2.goto(V3 + '/login');
    await p2.waitForTimeout(300);
    const eyebrow = await p2.evaluate(() => {
      const h = document.querySelector('#opac-auth > h1');
      return h ? getComputedStyle(h, '::before').content : 'none';
    });
    check('login page has no uppercase eyebrow', eyebrow === 'none' || eyebrow === 'normal', eyebrow);
    await ctx2.close();
  }

  await browser.close();

  console.log('\n\n========== RESULTS ==========');
  pass.forEach(p => console.log('  PASS  ' + p));
  fail.forEach(f => console.log('  FAIL  ' + f));
  console.log(`\n  ${pass.length} passed, ${fail.length} failed`);
  process.exit(fail.length ? 1 : 0);
})();
