# OPAC test harness

A stand-in Koha OPAC built from the real `opac-main.tt`, `opac-auth.tt`, `sco-main.tt`, `opac-results.tt` and `html_helpers.inc` templates of Koha 25.05.x. `serve.py` serves the fixtures with the OPAC stylesheet and script injected the way Koha injects them, adding latency to match a Zebra-backed Koha over a slow link. `test.js` and `layout-test.js` then drive it with headless Chromium through Playwright.

`serve.py` reads the stylesheets and scripts straight from [`opac/current`](../../opac/current) and [`opac/legacy`](../../opac/legacy), so a change to a master is picked up on the next request.

## Running it

You need Python 3 and Node.js.

```bash
npm install playwright && npx playwright install chromium
```

Start the five servers `test.js` expects, each in its own terminal (or with `&`):

```bash
python3 serve.py 8801 v4                # current build (use v4paste to test the paste copies)
python3 serve.py 8802 v3                # previous build, to prove regressions are fixed
python3 serve.py 8804 v4 brokenccl      # stand-in Zebra refuses the "not notforloan=3" term
python3 serve.py 8806 v4 empty          # a patron with nothing on loan
python3 serve.py 8807 v12               # the original v1.2, for the rosette comparison
```

Then run the checks:

```bash
node test.js                            # 60 functional checks
node layout-test.js http://127.0.0.1:8801   # 62 layout checks across seven widths
```

## What it does not cover

The live catalogue, real Zebra timings, real cover images and patron data, and browsers other than Chromium. See the "What was not tested" section of [`opac/current/INSTALL.md`](../../opac/current/INSTALL.md).
