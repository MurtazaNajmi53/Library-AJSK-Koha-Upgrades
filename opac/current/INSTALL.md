# Maktabat Aljamea (Sindh) — OPAC front-end

Koha 25.11.02 · Zebra · 13 November 2026 · **CSS v8 · JS v8 · Part E v2.4 · home block v4 · footer v2 · fonts v2**

Everything in this folder is current. Older versions are in [`../legacy/`](../legacy/)
(v7 and home block v3 are in [`../legacy/v7/`](../legacy/v7/); v6 in [`../legacy/v6/`](../legacy/v6/); v5, with the v1 footer, in [`../legacy/v5/`](../legacy/v5/)).

---

## What goes where

One saved report and eight things to paste, in this order. Nothing here needs server access.

| # | Paste this file | Into |
|---|---|---|
| 1 | `OpacHeaderFonts_V2.html` | Tools › HTML customizations › **opacheader** |
| 2 | `OpacLoginInstructions_V1.html` | Tools › HTML customizations › **OpacLoginInstructions** |
| 0 | `reports/new-arrivals.sql` | Reports › New report › New SQL report, **public** (see v8 below) |
| 3 | `OpacMainUserBlock_V4.html` | Tools › HTML customizations › **OpacMainUserBlock** |
| 4 | `OPACUserCSS_V8.paste.css` | System preferences › **OPACUserCSS** |
| 5 | `opaccredits-footer_V2.html` | Tools › HTML customizations › **opaccredits** |
| 6 | `OPACUserJS_V8.paste.js`, then Part E v2.4 | System preferences › **OPACUserJS**, the whole value (see v8 below) |
| 7 | `SCOUserCSS_V1.paste.css` | System preferences › **SCOUserCSS** |
| 8 | `SCOUserJS_V1.paste.js` | System preferences › **SCOUserJS** |

---

## v8 — New arrivals popup

**Four things change:** a new saved report, OpacMainUserBlock (V3 → V4),
OPACUserCSS, and OPACUserJS (Parts 0–D, F and the new G, then Part E,
which moves to v2.4).

### Installing it

1. **Back up first.** Copy the current OPACUserCSS, OPACUserJS and the
   OpacMainUserBlock entry into a dated note, and record the change in
   the project log with those old values. That is the rollback.
2. **The report.** Reports › New report › New SQL report. Name it "OPAC new arrivals
   (popup)", paste the whole of `reports/new-arrivals.sql` (it is only the query; the notes are in `reports/README.md`), tick
   **Public**, set **Cache expiry** to 300, and save. Run it once: it
   should list 24 titles, newest first, in well under a second. Note its
   number (the "ID" column in Saved reports). The OPAC returns its rows
   as plain lists, in column order, so keep the column order as it is.
3. **The report number.** It is saved as report **37**, and
   `newArrivalsReportId: 37` is already set in `OPACUserJS_V8.js` Part 0
   (and the paste copy). If the report is ever saved again under a new
   number, change it there and run `node build.js`. Without it the popup still
   works, from the old 8-second Zebra search, and opens by itself less
   often because the list is late.
4. **OpacMainUserBlock** — edit the existing entry and replace its text
   with `OpacMainUserBlock_V4.html` (with "Edit with text editor").
5. **OPACUserCSS** — replace the whole value with `OPACUserCSS_V8.paste.css`.
6. **OPACUserJS** — replace the whole value with `OPACUserJS_V8.paste.js`,
   followed straight after by the whole of
   `../../click-and-collect/02-opac-userjs-click-and-collect-buttons-and-dialog.js`
   (Part E v2.4). Part E must stay last.
7. Check, on a laptop and a phone: log out and in again (the popup opens
   once; Esc, Close or the dimmed margin closes it; it does not open on
   the next page); "New arrivals" in the account menu and on the home
   page's My library card; pressing a book in the filmstrip, the arrows,
   the arrow keys and a swipe; Click & Collect from the stage (the popup
   steps aside for the order dialog and comes back with "Ordered").

**Rollback:** paste the three backed-up values back. The report can stay;
nothing else reads it.

### What changes for readers

- **The new books come to them.** After login, if there are titles they
  haven't been shown, a full-screen popup opens with the newest title
  spotlighted on a navy stage: a large cover, where it is shelved, when it
  arrived, and a Click & Collect button (or Reserve, when every copy is
  out). Every other new title is in a filmstrip below; pressing one, the
  side arrows, the arrow keys or a swipe brings it onto the stage.
- **It never nags.** It opens by itself once per tab, only when something
  is new to that reader, and never on the kiosk, Koha's hold screen,
  print pages or over another dialog. If the list is slow it skips that
  time.
- **The home page has room.** The shelf column is gone. My library and
  Library information sit side by side, with an empty statistics slot
  below, hidden until it has content.

### What the browser remembers

| Where | Key | What | Why |
|---|---|---|---|
| localStorage | `ajNewArrivals:v1` | The list (an hour; 6 hours for the Zebra fallback) | Library-wide, nothing personal |
| localStorage | `ajNewSeen` | Per reader, the titles already shown, under a SHA-256 hash of the borrowernumber | "Already seen" has to outlast the tab. No reading or loan data; ten readers at most |
| sessionStorage | `ajNewShown` | That the popup has opened by itself in this tab | So it doesn't open again |

v7's `ajNewBooks:v3` is deleted on first load.

### Two things to know

- **The stage watermark uses the OPAC's own rosette outline**
  (`--aj-ros-line`, which the footer and loader already carry), not the
  design system's 12 KB hairline trace (`--aj-ros-hair`). Adding that to a
  preference Koha inlines on every page wasn't worth it for one popup.
- **The "In-Stock" rule is the report's too.** Records with any copy at
  notforloan 3 are left out in the SQL (`HAVING SUM(i.notforloan = 3) = 0`).
  If that code ever changes, change it in both places.

---

## v7 — one sticky bar, and the v6 follow-ups

**Two things change: OPACUserCSS and OPACUserJS** (Parts 0–D and F, and
Part E, which moves to v2.3). Nothing in the HTML customizations moves.

### Installing it

1. **Back up first.** Copy the current OPACUserCSS and OPACUserJS into a
   dated note, and record the change in the project log with those old
   values. That is the rollback.
2. **OPACUserCSS** — replace the whole value with `OPACUserCSS_V7.paste.css`.
3. **OPACUserJS** — replace the whole value with `OPACUserJS_V7.paste.js`,
   followed straight after by the whole of
   `../../click-and-collect/02-opac-userjs-click-and-collect-buttons-and-dialog.js`
   (Part E v2.3, from `/* ==== PART E` to `END PART E`). Part E changed
   in this release, so the old block is not kept this time.
4. Check, on a laptop and a phone: a search (scroll down: the header goes,
   the search bar stays with Filters, the quick filters and Sort; open
   Sort and pick "Title (A-Z)" and "40 per page"); the Click & Collect
   buttons (they arrive about two seconds sooner, and a title you have
   already ordered shows "Ordered"); a record page (the search bar
   sticks); the home page (scroll down slowly and back up: the logo
   changes once each way); the login page; Holds history; Advanced
   search; Authority search; Most popular.

**Rollback:** paste the two backed-up values back.

### What changes for readers

- **Results and record pages: one sticky bar.** The header scrolls away
  and the sand search band stays at the top. On the results page it also
  holds Filters, Available now, Item type, Collection and a Sort
  pull-out, in one line on a laptop. The pull-out has the sort orders and,
  under them, Results per page; each choice reloads the search on page
  one, as Koha's own form did. Below 1200px the buttons take a second line
  that scrolls sideways; on a phone the bar is about 128px, without the
  "Library catalog" scope (Advanced search has it). "Select all" and the
  add-to links now scroll with the page.
- **No flash of the old results layout.** The full-width list is there
  from the first paint.
- **Click & Collect buttons arrive sooner.** Measured on a 20-title results
  page with nothing cached: the first button at 0.7s (v2.2: 2.8s), all of
  them by 2.7s (v2.2: 5.6s). Until a button arrives, a pill holds its place.
- **Header:** scrolling back up slowly no longer makes the logo flicker.
- **Loader:** signing in says "Signing you in…", not "Searching the
  catalogue…".
- **Login page:** the help panel lines up with the login form: same top,
  same height.
- **Holds history** looks like the other account pages: card table, styled
  "Order by" row, smaller titles.
- **Advanced search, Authority search and Most popular** use the design
  system's fields, 44px checkbox rows and buttons, and cards.

### Worth doing in Koha's admin (not part of this release)

- **Holds history: hide the Library column.** There is one library, so the
  column repeats "Aljamea-tus-Saifiyah Library Karachi" over four lines in
  every row. Administration › Table settings › OPAC › holdshistory, untick
  Library. Record it in the project log.

### How v7 was tested

On the live catalogue in Chrome, with the v7 CSS, JS and Part E swapped
into each page (`tests/opac-harness/live-swap.js`; nothing changed in
Koha): the results page at 1440px and in a 390px frame, LTR and RTL; the
Sort pull-out; the sticky bar on scroll; a record page; the home and
login pages (header scroll test, help panel alignment at 1440px and
390px); Holds history; Advanced search; Authority search; Most popular.
Click & Collect timings were taken the same way, with the reader's orders
not cached. No order was placed.

Not tested: the harness suites (`test.js`, `layout-test.js`) stall on a
page load in this environment, with v6 as well as v7, so they could not
give a result; Safari and Firefox (`@media (scripting)` and
`field-sizing` are newer features, and the CSS falls back without them:
the results layout then waits for Part F as in v6); dark mode is not used
by the OPAC. The record page's Holdings tab looked empty in the preview,
but it does the same when the unchanged page is rewritten that way, so it
is an artefact of the preview, not of v7.

---

## v6 — header, footer, results and account pages

**Three things change: OPACUserCSS, OPACUserJS and the opaccredits entry.**
Nothing else moves.

### Installing it

1. **Back up first.** Copy the current OPACUserCSS, OPACUserJS and the
   opaccredits entry into a dated note, and record the change in the project
   log with those old values. That is the rollback.
2. **OPACUserCSS** — replace the whole value with `OPACUserCSS_V6.paste.css`.
3. **opaccredits** — straight after step 2, open the existing entry with
   "Edit with text editor" and replace its contents with
   `opaccredits-footer_V2.html`. The v6 stylesheet no longer styles the v1
   footer markup, so the footer looks plain until this is done.
4. **OPACUserJS — do not replace the whole box.** Select from the top down to
   the line just before `/* ==== PART E` and paste `OPACUserJS_V6.paste.js`
   over it. The paste copy ends with the new Part F; Part E stays after it.
5. Check the home page (scroll down and back up; open the account menu), a
   search (Filters, the three quick filters, one filter applied), Your
   summary, Personal details, Checkout history, the login page and one kiosk,
   on a laptop and a phone.

**Rollback:** paste the three backed-up values back.

### What changes for readers

- **Header.** The bar stays at the top. Scrolling down minimises the large
  logo, and the small one writes itself in from right to left while the
  library name slides over. Scrolling back reverses it, faster. Under
  reduced motion the logo only fades.
- **Account menu on the home page** now opens over the search band. It used to
  fall behind it: the header and the band each carry a
  `view-transition-name`, which made each its own stacking layer, and the
  band came later in the page.
- **Footer.** The design system's sand footer: logo, the Arabic name مكتبة الجامعة
  (on Arabic pages only; English pages stay in English), address and
  email, three link columns (Catalogue, Your account, Aljamea), the copper
  rule, and Back to top. The links line up, because every column starts with
  a heading and every link is one 44px row. The rosette watermark is drawn
  from the loader's outline at 18%.
- **Search results** use the full width of the page, in one card panel;
  each result's actions (Click & Collect, Save to lists, Add to cart) sit
  at the far edge, as on UCL's Primo, so rows no longer stop half-way. Koha's "Refine your
  search" column moves into a **Filters** drawer that slides in from the
  reading-start edge (with a count of filters applied, Clear all, and Show N
  results). Above the results, large 52px buttons give one-press access to
  **Available now**, **Item type** and **Collection**; the last two open a
  short menu of values. Which three show is the `QUICK` list at the top of
  Part F. Page numbers appear only below the results; the top set took a
  whole row (several on a phone) and is hidden.
- **Account pages.** The menu is a card, tabs use the underline indicator,
  tables are cards with band heads and no stripes, form sections are cards
  with start-aligned labels, alerts are bands. The breadcrumb reads "Your
  account" and Your summary says "Hello, Murtaza." with "Not Murtaza? Log
  out", instead of the full name and ITS number.
- **Login help cards** lose the copper inline-start rule.

### What it costs

The paste CSS goes from 55 KB to 75 KB (13.8 KB gzipped); the JS from
54 KB to 67 KB (20 KB gzipped). The footer adds no artwork: the logo is the
same hotlinked file as the header, and the rosette comes from the script.

### How v6 was tested

Against the live catalogue in Chrome, with the v6 CSS, JS and footer swapped
into the page in the browser only (no Koha setting was changed):

- **Laptop (1440px):** home (account menu open over the band, scroll stick
  and unstick), results with no filter and with Item type: Book, the Filters
  drawer and quick filter menus, Your summary, Checkout history, Personal
  details, the footer.
- **Phone (390px, in a frame):** home, results, Filters drawer, footer. No
  sideways scroll. Two fixes came out of it: the header now stays one 60px
  row (the account icon used to drop to a second row, making the sticky bar
  about 100px), and Koha's results toolbar no longer sticks below 768px
  (it wraps to about 460px on a phone and hid most of the screen).
- **RTL (dir="rtl" lang="ar" set on the page):** header, logo write-in,
  home widgets, results, the footer with مكتبة الجامعة. One fix: the open
  drawer stayed off-screen on RTL pages.

Not checked: the real Arabic translation (only simulated above), the login
page, the kiosk, and the harness (`tests/opac-harness`) suites.

---

## v5 — the OPAC moves onto the design system

**Three things change: #1, #4 and #5.** The other four stay as they are.

### Installing it

1. **Back up first.** Copy the current OPACUserCSS, OPACUserJS and the
   opacheader entry into a dated note, and record the change in the project
   log with those old values. That is the rollback.
2. **opacheader** — open the existing entry and replace its contents with
   `OpacHeaderFonts_V2.html`. It adds Tajawal (Arabic interface pages only)
   and the DM Sans italic.
3. **OPACUserCSS** — replace the whole value with `OPACUserCSS_V5.paste.css`.
4. **OPACUserJS — do not replace the whole box.** The live value is Parts 0–D
   *followed by the Click & Collect Part E*
   (`click-and-collect/02-opac-userjs-click-and-collect-buttons-and-dialog.js`).
   Select from the top of the box down to the line just before
   `/* ==== PART E`, and paste `OPACUserJS_V5.paste.js` over that selection.
   Part E stays exactly where it is.
5. Check the home page, one search, one record, the login page and one
   kiosk, on a laptop and a phone. The next section says what to look for.

**Rollback:** paste the three backed-up values back. Nothing else changed.

### What changes for readers

- **Same layout, calmer surface.** The three home widgets lose their copper
  top rule and get the system's card shadow instead. Everything is
  `surface-*`, `text-*`, `action*` and `border-*` tokens now, so colours are
  the same brand values, applied by job.
- **One type family.** DM Sans sets headings, titles and text, with tighter
  tracking on headings. Noto Sans no longer sets headings; it only fills in
  ḍ ṣ ḥ ṭ ẓ ʿ, which DM Sans lacks. Arabic and LSD in record data still use
  Kanz-al-Marjaan, then Amiri. Tajawal is used only if the OPAC is ever
  shown in Arabic, and never for titles (it lacks 23 LSD letters).
- **Bigger targets.** Buttons, pager numbers, shelf arrows, view pills, the
  sort select, menu items, tabs, breadcrumbs, facet links, footer links and
  the account card's rows are all at least 44px. Pages are a little taller
  as a result, most visibly in the facets column and the toolbar.
- **One focus ring**: 3px, blue, 2px outside the element, everywhere.
- **A different loader.** A thin copper bar runs along the top of the screen
  as soon as a link is followed. Only if the next page takes more than
  1.2 seconds does the rosette appear, drawing itself petal by petal, with a
  line saying what is happening ("Searching the catalogue…"). It used to
  spin and pulse after 0.4 seconds. The rosette is now the design system's
  traced SVG, so it no longer depends on an image on the Jamea website.
- **Login page**: the uppercase "LIBRARY CATALOGUE" line is gone.
- **Right-to-left ready.** Layout uses logical properties, so if Koha's
  Arabic translation is switched on, the page mirrors (shelf arrows flip,
  cover sits on the right of a record). See "Not done" below.

### What it costs

| Paste copy | v4 gzipped | v5 gzipped |
|---|---|---|
| OPACUserCSS | 8.7 KB | 10.7 KB |
| OPACUserJS (Parts 0–D) | 10.3 KB | 17.3 KB |

About 9 KB more per page view. 6.1 KB of that is the rosette artwork, which
sits in the script, not the stylesheet, on purpose: the script runs at the
end of the page, so it adds nothing to the time before the page first
appears. The coordinates were rounded to whole units (0.1px at the size
it is drawn), which saved 1.6 KB.

**Why not paste the design system's own files?** Its notes say to put
`tokens.css` + `components/bundle.css` in OPACUserCSS. That would be 150 KB
(42 KB gzipped) on every page, mostly styling `.aj-*` component markup that
Koha never outputs. `tokens.css` also defines classes called `.title`,
`.label`, `.nav`, `.h1` and `.body`, which Koha and Bootstrap use for their
own markup. V5 takes only the token *values*.

### Kept for compatibility

`SCOUserCSS_V1` and Click & Collect Part E still read the old `--aj-*`
variables (`--aj-blue`, `--aj-copper-deep`, …). V5 keeps those names as
aliases of the new tokens, at the end of section 1. Remove each alias once
nothing reads it.

### Not done in v5, on purpose

- **Dark mode.** The tokens have dark values, but Koha's own Bootstrap,
  DataTables, modals and jQuery UI widgets are light only. A dark OPAC would
  be patchy until each of those is styled and tested.
- **Masthead and footer redesigns.** The design system's two-tier Masthead
  and link-column Footer need new HTML customizations, not CSS. V5 restyles
  Koha's existing header and footer instead.
- **Arabic wording in the widgets.** The card, shelf and loader strings are
  English. On an Arabic interface page the layout mirrors, but those strings
  stay English and their punctuation reads backwards. Needs translations.
- **Below 44px still:** the cover-switch dots under a cover (now 24px; there
  is no room for three 44px dots under a 100px cover) and Koha's result
  checkboxes.
- **The bookplate lettering** (the generated cover) stays under 13px. It is
  artwork standing in for a cover image, not running text.

### How v5 was tested

The harness in [`tests/opac-harness/`](../../tests/opac-harness/), against
both the masters and the paste copies: the 60 functional checks plus 14 new
design-system checks (tokens defined, legacy aliases present, no card top
rule, radius, 44px arrows and rows, SVG chevron, 3px focus, progress bar
first, rosette after the wait with a label, stop clears both, no eyebrow),
and the 62 layout checks across eight widths. All pass. The loader checks
were updated for the 1.2-second wait. Also looked at by eye in screenshots:
the home page and login page against v4, the rosette mid-draw, and the home
page with the document switched to right-to-left.

Not tested: the live catalogue, real fonts from Google (the sandbox has no
internet), Safari and Firefox, and a real Arabic Koha translation.

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
