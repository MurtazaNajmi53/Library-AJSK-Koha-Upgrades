Screen transitions between pages, using the browser's View Transitions API. Header and search band stay still, the content cross-fades with a 10px lift, and a book cover that appears on both pages morphs from its place in the results to its place on the record.

## How it works
- **Between pages (Koha):** `@view-transition { navigation: auto; }` in the stylesheet turns it on for same-origin navigations. No script needed. Browsers without support simply load the page as before.
- **Shared cover:** put the same `style="view-transition-name: cover-<biblionumber>"` on the cover in results and on the record page. Names must be unique on a page.
- **Within a page:** wrap a DOM change in `Aljamea.transition(fn)`. It falls back to an instant change.
- Header and search carry `view-transition-name: aj-header` / `aj-search` and do not animate.

## Timing
Old page out: `duration-fast`, `ease-in`, fade and rise 6px. New page in: `duration-slow`, `ease-out`, fade and rise 10px. Morphs: `duration-slow`, `ease-out`.

## Accessibility
Off under reduced motion. Focus moves to the new page as normal; for in-page swaps, move focus to the new heading yourself.

## Don't
- Slide whole pages sideways: it fights reading direction in RTL.
- Give two elements on one page the same transition name (the transition is skipped).
