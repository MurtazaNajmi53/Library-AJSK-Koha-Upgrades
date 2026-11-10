# Maktabat Aljamea (Sindh) — OPAC front-end, v3

Koha 25.11.02 · Zebra · 20 September 2026 · **CSS v4 · JS v4**

Everything in this folder is current. Older versions are in [`../legacy/`](../legacy/).

---

## What goes where

Seven things to paste, in this order. Nothing here needs server access.

| # | Paste this file | Into |
|---|---|---|
| 1 | `OpacHeaderFonts_V1.html` | Tools › HTML customizations › **opacheader** |
| 2 | `OpacLoginInstructions_V1.html` | Tools › HTML customizations › **OpacLoginInstructions** |
| 3 | `OpacMainUserBlock_V3.html` | Tools › HTML customizations › **OpacMainUserBlock** |
| 4 | `OPACUserCSS_V4.paste.css` | System preferences › **OPACUserCSS** |
| 5 | `OPACUserJS_V4.paste.js` | System preferences › **OPACUserJS** |
| 6 | `SCOUserCSS_V1.paste.css` | System preferences › **SCOUserCSS** |
| 7 | `SCOUserJS_V1.paste.js` | System preferences › **SCOUserJS** |

For the three HTML customizations: **use "Edit with text editor", not the visual
editor.** The visual editor rewrites class names and strips tables, which breaks
the layout.

### Delete the old entry first

If `FINAL_OpacMainUserBlock_V2.html` or `aj-my-library-block.html` is still
installed as an OpacMainUserBlock entry, **delete it** before adding #3, or the
home page will show two of every box.

### One setting to check

`OPACUserSummary` must be **"Don't show"** — the custom "My library" card
replaces it. `opacreadinghistory` must be **"Allow"**, or the yearly count
cannot be worked out. Both were already correct in v2.

---

## Why there are two copies of each file

`OPACUserCSS_V4.css` and `OPACUserJS_V4.js` are the documented masters — read this one when you want to
change something. `OPACUserCSS_V3.paste.css` is the same file with the comments
removed, and it is the one that goes into Koha.

This is not fussiness. Koha prints these prefs inline in the HTML of every page,
so every comment is downloaded by every reader on every page view. Stripping
them saves **13 KB gzipped per page** across the four files — which is more than
the v3 additions cost in the first place.

The two were tested side by side: the same 122 checks pass against both, and the
rendered home page is pixel-for-pixel identical.

To regenerate the paste copies after editing a master:

```
npm install terser css-tree
node build.js
```

The build refuses to write a file that does not parse. If you would rather not
run it, paste the documented master instead — it works exactly the same, just
larger.

---

## v4 CSS — the widgets now use the whole page

**Only the stylesheet changed. `OPACUserJS_V4.paste.js` is untouched — do not
re-paste it.**

### The three widgets were living in three quarters of the page

Not a ratio problem. Koha's home page is a Bootstrap row of `col-lg-9` (the main
column) beside `col-lg-3`, which holds the login box or the built-in user
summary. With `OPACUserSummary` set to "Don't show" and no `OpacNavRight` entry,
that second column is still rendered — and stays completely empty. Measured on
your catalogue at 1440px: **342px of a 1368px row given to nothing.**

Hiding it takes the widget row from **1002px to 1344px** — 34% more space before
a single ratio changed.

`:empty` will not find that column, because Koha leaves whitespace inside the
div and whitespace counts as a text node. The rule asks instead whether the
column contains any *element*.

### The proportions

At 1200px and above, `2fr : 1fr : 1fr` — half the row for the shelf, a quarter
each for the other two. Live at 1440px: **648 / 324 / 324**.

Between 992 and 1199px the shelf eases back to about 42% with a 240px floor
under the other two, because a true quarter of 1024px is 247px and the account
card's "Due in the next 7 days" row starts to wrap below that. The shelf gives
up width first — it degrades gracefully by showing fewer covers; the other two
do not.

### Smaller screens

| Width | Layout |
|---|---|
| ≥ 1200px | three across — books (50%), account (25%), information (25%) |
| 992–1199px | three across — books ~42%, other two ~26% each, floor of 240px |
| 768–991px | two rows — account + information side by side, shelf full width below |
| < 768px | one column — account, then books, then information |

Your account card leads at every size below the full three-across layout. A
reader on a small screen has almost always come to check what is due, not to
browse, and keeping it first means the reading order never reshuffles as the
screen narrows.

Covers grow with the space: 108px on small screens, 116px from 1200px, 124px
from 1500px. That is roughly 4–5 covers visible at 1440px and 7 at 1920px.

### A bug worth recording

The first version of this used
`.row:has(> .col-lg-3:not(:has(*)))`. That is **invalid CSS** — `:has()` may not
be nested inside another `:has()` — and browsers drop such a rule silently. The
empty column disappeared but the main column never widened. Writing it as
`.row:not(:has(> [class*="col-lg-3"] > *))` keeps the `:has()` to one level.

The local tests passed it, because the test page had no Bootstrap grid loaded —
so its columns had no widths and the main column filled the row no matter what.
Only the live check caught it. The harness now loads the same minimal Bootstrap
grid Koha does, and reintroducing the broken selector now fails six checks.

**Browsers without `:has()`** (Firefox before 121, Safari before 15.4) simply
keep the old narrower layout. Nothing breaks. That is why this needed no
JavaScript change.

---

## v4 JS — three fixes, after testing against the live catalogue

### The bug that broke both widgets

v3 shipped with a fault that stopped the account card and the new-books
shelf from working at all. The card said *"Your session has ended"* and the
shelf said *"This list could not be loaded"*, while the reader was plainly
logged in.

`isLoginPage()` decided whether a fetched page was the login screen by
searching the raw HTML for the text `id="opac-auth"`. But Koha inlines
OPACUserJS into **every** OPAC page via `opac-bottom.inc` — so every page the
script fetched contained the script, including that very string, sitting in
`isLoginPage`'s own source. The test was true for every page, always.

v1.2 did not have this fault: it asked a *parsed document* for the element,
which never matches text inside a `<script>`. v3 changed it to a raw string
search to avoid parsing, and in doing so made it self-referential.

It now reads the id off the `<body>` tag. Two details, both confirmed against
the live site: Koha's `bodytag.inc` writes the attribute in **uppercase**
(`<body ID="opac-user" …>`), so the match is case-insensitive; and the first
`<body` in a document is the real one, so a later copy inside the inlined
script cannot win.

Verified live: `isLoginPage()` on your account page returns `false` (v3
returned `true`), and a real login page is still correctly detected.

### The search results container has no id

Koha's markup is `<div class="searchresults"> … <table class="table
table-striped">`. v3 looked for a table with `id="searchresults"`, never found
it, and silently fell back to parsing the whole results page — **398 KB** on
your catalogue — twice. Slicing now accepts any attribute as its marker, so it
targets the class. Confirmed live: the v3 marker is absent, the v4 marker is
found.

### Account counts now come from the tab labels

Koha prints the count in the tab itself — "Checked out (3)", "Overdue (1)",
"Holds (2)", "Charges (Rs 120.00)" — and prints it whether or not the matching
table is rendered. A patron with nothing on loan gets the label and **no table
at all**, so counting table rows cannot tell "none" apart from "not rendered".
The labels are read first; the tables are still used for the two things no
label carries (loans falling due soon, holds waiting to be collected), and row
counting stands in if a label is missing.

### About that 5–6 seconds — I finally measured the real thing

**The new-books search takes about 8 seconds on your server, and no front-end
change can fix it.** Measured live, repeatedly:

| query | time |
|---|---|
| `allrecords` + `not notforloan=3`, sorted by acqdate | 7.5–8.3 s |
| the same with **no sort at all** | 8.1 s |
| the same sorted by relevance | 6.2 s |

So it is not the sort. The cost is matching and retrieving a result set of
**47,195 records** and building a 398 KB results page. I also tried narrowing
by acquisition date (`acqdate,st-date-normalized,ge=…`, and two other forms) —
all returned no results, so that index does not appear usable here.

What this means in practice:

- The six-hour `localStorage` cache is doing the real work. The first reader in
  each browser, each six hours, waits ~8 s; everyone else gets the shelf in
  ~100 ms.
- Because the card and the news widget no longer wait for the shelf, the page
  is useful long before the books arrive — the card lands in under a second.
- **Worth checking in the staff client:** whether item subfield 952$d (Date
  acquired) is actually populated. If it is mostly empty, "New in the library"
  is not really showing your newest books, and a curated Koha list would be
  both faster and more accurate. I could not check this from the browser — the
  extension blocked the request.

### Good news on `not notforloan=3`

I could not test this against Zebra last time. It works: **47,422 records
plain, 47,195 with the exclusion** — 227 records left out, and a different
(correct) set of titles at the top. The automatic fallback stays in place
anyway.

---

## The six changes

### 1. Login page wording

Koha's built-in "stop by the circulation desk" and "stop by your local library"
text is gone. `OpacLoginInstructions` replaces it at the template level, so the
old wording is never sent to the browser — no flash of it before a script can
change it, and it still reads correctly with JavaScript off.

The replacement offers the library email and the Front Office, with hours.

**The email link opens Gmail's compose window.** That suits readers signed in to
their `@jameasaifiyah.edu` account. If you would rather it opened whatever mail
app the device uses — better on a phone — swap the whole `href` for
`mailto:library_support.karachi@jameasaifiyah.edu`. The comment at the top of
that file says the same thing.

### 2. Self-checkout kiosks

**The ITS number no longer appears anywhere on the kiosk.** Two separate fixes,
because there were two leaks:

- *As it is scanned.* The card reader is a keyboard: tapping a card typed the
  number into a plain text box, in full view, until the form submitted. It is
  now masked with `-webkit-text-security`, which hides the characters without
  turning the box into a password field — a password field would make the
  browser offer to save it, which a shared kiosk does not want. SCOUserJS falls
  back to a password field on a browser too old for that (Firefox before 122).
- *After login.* Patron names here begin with the ITS number, so Koha's "You are
  logged in as 30454007-Mulla … Najmi." and the "Checkouts for …" caption both
  printed it. SCOUserJS strips the number and keeps the name. CSS hides both
  lines until that has happened, so the number is never painted — not for one
  frame. If SCOUserJS is ever removed, they stay hidden: the reader loses a
  greeting, not their privacy.

**Layout.** Koha lays the scan row out as Bootstrap `col / col-3 / col-auto`,
which puts the barcode box in a quarter of the width — fine on a wide desk
monitor, very small on a screen turned on its side. It is now a single stack at
`--sco-col` wide, with 76px touch targets, and the checkout table becomes a
stack of cards in portrait instead of a table nobody can read.

**Speed.** The kiosk was running the whole catalogue's JavaScript for nothing.
Koha's `sco-main.tt` includes `opac-bottom.inc`, which runs `OPACUserJS`
unconditionally, so the kiosk was doing the header rewriting, the account-menu
surgery and building a page-loading rosette on every page. OPACUserJS v3 detects
`body#sco_main` and stops on its first few lines.

### 3. Speed on the home page

Measured against the currently installed v1.2, same fixtures, same simulated
server latency:

| | v1.2 | v3 |
|---|---|---|
| requests start | 351 ms | **28 ms** |
| account card on screen | 3 221 ms | **891 ms** |
| new books on screen | 2 730 ms | 2 402 ms |
| library information | (did not exist) | **104 ms** |
| second visit, new books | 2 730 ms | **135 ms**, no request at all |

What changed:

- **The Google Fonts `@import` moved out of the stylesheet.** This is the
  biggest single change and it affects *every* page, not just the home page.
  Koha puts OPACUserCSS in an inline `<style>` in the head, and an `@import`
  inside inline CSS is fetched in a chain: download the HTML, parse 47 KB of
  stylesheet, only *then* discover a font stylesheet is needed, request it,
  wait, then fetch the font files. Nothing renders until that finishes. As a
  `<link>` in `opacheader`, the browser's preload scanner finds it while the
  page is still arriving.
- **The three page requests start immediately** and run together, instead of
  waiting for `DOMContentLoaded` and going one at a time.
- **The account card no longer waits for the reading history.** It draws as soon
  as `opac-user.pl` arrives; the yearly count fills in afterwards.
  `opac-readingrecord.pl?limit=full` is by far the heaviest of the three and is
  now fetched at low priority.
- **Only the needed part of each fetched page is parsed.** Handing a 450 KB
  reading history to `DOMParser` costs real time on a phone; v3 slices out the
  one table first, with a full-parse fallback if Koha's markup ever changes.
- **The new-books list is cached in `localStorage` for six hours.** It is the
  same list for everyone, so only the first reader of the day waits.
  *Anything personal still uses `sessionStorage`*, which the browser clears when
  the tab closes — deliberate, on shared library machines.
- Cover images preconnect to Amazon and Open Library up front, and only the
  first four load eagerly.

**One honest caveat.** These figures come from a local stand-in for Koha with
latency I chose to match the 5–6 seconds you described. They show the shape of
the improvement, not a promise about your server. If the real delay turns out to
be Zebra sorting 28 000 records by acquisition date, no amount of front-end work
will fix it — that would need a smaller `count` or a different query. Worth
checking the network panel on the live site once this is in.

### 4. "New in the library" hides In-Stock titles

"In-Stock" is **authorised value 3** in the `NOT_LOAN` list. Settings at the top
of OPACUserJS v3:

```js
newBooksHideNotForLoan: [3],        // the authorised value CODES to leave out
newBooksHideMode:       "any-copy", // or "all-copies"
newBooksHideStatusText: ["In-Stock"],
```

**The filtering is done by the search itself, on the code.** Koha indexes item
subfield `952$7` into Zebra's numeric `notforloan` index
(`etc/zebradb/ccl.properties`: `notforloan 1=8008 4=109`), so the query says:

```
ccl=allrecords,AlwaysMatches='' not notforloan=3
```

Matching on the code means renaming the status in Koha cannot break it. It is
also faster: the records never travel, so the shelf asks for 16 results instead
of 40 and has nothing to throw away.

**One consequence worth knowing.** That Zebra index is record-level, built from
every item on the record. `not notforloan=3` therefore drops a record if *any*
copy is In-Stock — so a title with three In-Stock copies and one on the open
shelf disappears too. Zebra cannot express "has at least one copy that is not
code 3" across items.

If you would rather keep those mixed records, set:

```js
newBooksHideMode: "all-copies",
```

which runs the plain search and filters in the browser, hiding a record only
when no copy is available to a reader. It costs a larger page of results,
because records are fetched and then discarded.

**Why `newBooksHideStatusText` still exists.** `all-copies` mode has to work on
the status *description*, not the code — `C4/XSLT.pm` sets a not-for-loan item's
substatus to the authorised value's `opac_description`, so the results page
prints `In-Stock` and the number 3 appears nowhere in the HTML. **If you ever
rename that authorised value, change this line to match.** It is ignored in
`any-copy` mode except by the fallback below.

**The fallback.** I could not test a CCL term against your live Zebra. If that
query ever errors or returns nothing, the widget says so once in the browser
console and quietly re-runs the plain search with the description filter, so a
Zebra quirk makes the shelf a little slower rather than blank. Both paths are
covered by the tests.

### 5. The "Library information" widget

**Staff maintain this entirely from the staff interface. No files, no code.**

> Staff interface › Tools › Additional tools › News › New entry
> Display location: **OPAC** (or All)

Each entry has a title, a rich-text body, a publication date and an
**expiration date**. That last one is the point: a holiday notice or a one-off
programme removes itself on the day, instead of sitting there until March.

Koha already prints these entries on the home page. The widget moves them into
the third column and restyles them — **nothing is fetched**, which is why it
appears in 104 ms. Formatting staff enter (bold, lists, links, a table of
timings) is carried across as-is.

Suggested entries to start with:

- *Library timings* — no expiration date, it is permanent
- *Computer lab timings* — no expiration date
- a holiday notice — expires the day the library reopens
- an upcoming programme — expires the day after the event

The staff member needs a Koha account with the `edit_news` permission. That is
the only thing to hand over.

### 6. The rosette

**Why it was invisible on phones and misplaced on the kiosks: one cause.** The
overlay was sized with `position: fixed; inset: 0`, which measures the *layout*
viewport — not the part of the page a reader can actually see. Pinch-zoom on a
touchscreen makes those two different, and the rosette gets centred somewhere
off-screen.

It is now pinned to `window.visualViewport` and re-measured on scroll and zoom.
This was reproduced and then verified: with the page scaled 3× and panned, the
old code puts the rosette outside the visible area and v3 keeps it inside.

The 0.4-second wait before it appears is also no longer a CSS transition delay —
a browser busy starting the next page could skip it. It is a JavaScript timer
now, and the overlay is promoted to its own compositor layer in advance.

### Also, while there

- The three widgets share one card design and one grid, so they line up: same
  top edge, same bottom edge, same padding. Changing `padding` in section 15d of
  the CSS changes all three at once.
- Below the three-across layout, **your account always comes first** — on a
  phone and on a tablet. The left-to-right order you asked for (new books,
  account, information) applies from 1100px up, where all three fit side by side.
- A long notice scrolls inside its own box and fades at the bottom, rather than
  dragging the row out of alignment or slicing a sentence in half.
- With JavaScript off, the three empty boxes are hidden and Koha's own news block
  comes back.

---

## How this was tested

A stand-in Koha was built from the real `opac-main.tt`, `opac-auth.tt`,
`sco-main.tt`, `opac-results.tt` and `html_helpers.inc` of Koha 25.05.x, served
locally with latency, and driven with headless Chromium at five viewports:
1440px, 834px, 390px, iPhone 13, and 1080×1920 portrait for the kiosk.

60 functional checks plus 62 layout checks, all passing against both the documented masters and the generated
paste copies. They cover: load timing against v1.2, the warm-cache second visit,
widget order and alignment at three widths, In-Stock filtering on both paths —
the `not notforloan=3` search *and* the fallback, including a stand-in Zebra
that refuses the term — the rosette under pinch-zoom, ITS number masking and
stripping, OPACUserJS stopping on the kiosk, touch target sizes, sideways
overflow, the login wording, and a clean console on all four pages.

`test.js` and `serve.py` are kept in [`tests/opac-harness/`](../../tests/opac-harness/) if you want to
re-run them after a change.

### What was *not* tested

- The live catalogue. Chrome was not reachable from this session, so nothing here
  has touched `library-karachi.jameasaifiyah.org`.
- Real cover images, real Zebra timings, real patron data.
- **The `not notforloan=3` term against a live Zebra.** The index and the CCL
  definition are confirmed in Koha's source; the term itself is not something a
  stand-in can prove. This is what the fallback is for — but do glance at the
  shelf after installing, and at the browser console if it looks thin.
- The rosette image itself, which is hotlinked and unreachable from the sandbox.
- Safari and Firefox. Chromium only.

Worth a look on the live site before you call it done: the network panel on the
home page, one kiosk, and one phone.
