# OPAC v8.3: brief and known issues

Recorded on 13 Nov 2026, after v8.2 was merged (PR #7).

## The brief

v8.3 refines and fixes bugs. The aim is a version fit to present.

1. **Audit first.** Run a complete audit of the whole OPAC, every page it has, against every design skill available. That covers the installed skills (design-skills, design, hzblj ui-*, frontend-design, accessibility) and the three cloned repositories: anthropics/skills, vercel-labs/agent-skills web-design-guidelines and ui-ux-pro-max.
2. **Then a plan.** Write a plan from the audit, and execute it only after approval.
3. **Then test rigorously.** Run several rounds of tests until no issues remain.

## Known issues (from the user's review of v8.2)

| # | Issue | Screenshot |
|---|---|---|
| 1 | **Relevance ordering looks wrong.** A keyword search for "age of AI" should return a particular book first, but it doesn't. Check Koha's relevance ranking and the Sort pull-out (`sort_by`, Zebra settings), and what the results bar does to the query. | `05-relevance-age-of-ai.webp`: "Dante and Pound : the epic of Judgement", which matches only "of", ranks above "The age of AI". "Available now" is on (the Filters badge shows 2) |
| 2 | **A quick filter breaks the sticky bar.** Once a quick filter is on (e.g. "Available now"), its button grows (tick plus label), and the sticky search band falls back to the old, thicker two-line layout fixed in v7. | `04-sticky-bar-with-filter-on.webp` (Filters shows a "2" badge; the bar runs to two lines) |
| 3 | **Arabic searches lose titles.** For Arabic-script searches, some result rows show no title or record details at all, only the cover and buttons. The first row in the screenshot is empty, while the second is fine. | `01-arabic-results-missing-title.webp`, `03-result-row-negative-space.webp` |
| 4 | **"Select titles" toolbar is misaligned.** Its text and buttons don't sit on one horizontal line ("Tick titles to act on them" sits higher than the buttons). | `02-select-titles-toolbar-misaligned.webp` |
| 5 | **Results pages have too much negative space.** Covers sit too close to the card border, and text is too small to fill its area. This needs a serious audit of the results page, then fixes. | `03-result-row-negative-space.webp`, `01-arabic-results-missing-title.webp` |
| 6 | **Result titles keep the statement of responsibility** ("Dante and Pound : the epic of Judgement / James J. Wilhelm."), while the record page and the dialog now drop it. Seen in the same screenshot | `05-relevance-age-of-ai.webp` |

## First guesses (to verify, not conclusions)

- **3:** probably Part F2's row tidy hiding Koha's lines. Possibly `.results_summary.aj-empty` or the `.title_summary > :is(...)` rule catching the title, or the title link for these records sitting in an element hidden by 20b. Check the DOM of an affected row (search: زمان).
- **2:** with a chosen value, the quick-filter button grows (tick, label and value). Section 10d's one-line layout probably assumes fixed widths. Check `.aj-rbar` wrapping at 1200px and up.
- **1:** Part F rebuilds the Sort and per-page links with `URLSearchParams`. Check whether `sort_by` defaults or a `limit` reorders the results, and compare with the plain Koha result order for the same query.
