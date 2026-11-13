# OPAC test harness

A stand-in Koha OPAC built from the real `opac-main.tt`, `opac-auth.tt`, `sco-main.tt`, `opac-results.tt` and `html_helpers.inc` templates of Koha 25.05.x. `serve.py` serves the fixtures with the OPAC stylesheet and script injected the way Koha injects them, adding latency to match a Zebra-backed Koha over a slow link. `test.js` and `layout-test.js` then drive it with headless Chromium through Playwright.

`serve.py` reads the stylesheets and scripts straight from [`opac/current`](../../opac/current) and [`opac/legacy`](../../opac/legacy), so a change to a master is picked up on the next request.

## Running it

You need Python 3 and Node.js.

```bash
npm install playwright && npx playwright install chromium
```

The tests use Playwright's own Chromium. Set `CHROME_PATH` to use another browser binary.

Start the five servers `test.js` expects, each in its own terminal (or with `&`):

```bash
python3 serve.py 8801 v8                # current build (use v8paste to test the paste copies; v7 is the previous build)
python3 serve.py 8811 v8 report         # v8 with the New arrivals list from fixtures/new-arrivals.json (a stand-in public report)
python3 serve.py 8802 v3                # previous build, to prove regressions are fixed
python3 serve.py 8804 v7 brokenccl      # stand-in Zebra refuses the "not notforloan=3" term
python3 serve.py 8806 v7 empty          # a patron with nothing on loan
python3 serve.py 8807 v12               # the original v1.2, for the rosette comparison
```

Then run the checks:

```bash
node test.js                            # 74 checks: 60 functional, 14 design system
node layout-test.js http://127.0.0.1:8801   # 62 layout checks across seven widths
```

## Previewing on the live OPAC

The fixtures have no results, record, account or advanced-search pages
with real data, so those are checked on the live catalogue instead,
without changing anything in Koha:

1. Serve the repository on `127.0.0.1:8765` with CORS headers and
   `Access-Control-Allow-Private-Network: true` (run it outside any
   sandbox that blocks local ports).
2. Sign in on the OPAC in Chrome, open the page to check, and in the
   console run:

   ```js
   eval(await (await fetch("http://127.0.0.1:8765/tests/opac-harness/live-swap.js")).text());
   await ajLiveSwap({ version: "V8", partE: true });
   ```

   It re-fetches the page and rewrites it with the masters from
   `opac/current` (and Part E from `click-and-collect/`). `rtl: true`
   previews right to left; `probe: true` times the Click & Collect
   buttons into `window.__ccFirst` and `window.__ccAll`.

Swap once per page load: a second swap in the same tab redeclares Koha's
own `let` variables and its scripts stop. Known artefacts, not bugs: the
record page's Holdings tab stays closed, and in a srcdoc frame the Cart
link shows.

## What it does not cover

The live catalogue, real Zebra timings, real cover images and patron data, and browsers other than Chromium. See the "What was not tested" section of [`opac/current/INSTALL.md`](../../opac/current/INSTALL.md).
