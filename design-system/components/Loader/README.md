Loading in two layers. Every page change gets a slim progress bar while the page stays readable; only a wait that runs long brings in the rosette, which draws itself petal by petal and fills with copper, with a line saying what is happening.

## Progress bar
- 3px, `action`, sits on the bottom edge of the header (or the top of the viewport when there is no header). Grows from the reading-start edge, so from the right in RTL.
- Appears after 120ms, so instant pages never flicker. Creeps towards 90% and only completes when the work is done, then fades.
- API: `Aljamea.progress.start()` and `Aljamea.progress.done()`.

## Rosette loader
- Frosted scrim (`overlay` plus an 8px backdrop blur), the mark at 88px, and a label in `text-muted`.
- One cycle lasts `duration-loader` (2.4s): a sweep draws the four petals in `action`, a quarter turn each; the disc fills with `ornament`; it holds, clears and starts again.
- Appears 300ms after it is asked for, and `loader.begin()` only asks after 1.2s of waiting, so most page changes show the bar alone.
- API: `Aljamea.loader.show(label)`, `hide()`, `begin(label, afterMs)`. `Aljamea.loader.bind()` wires both layers to links and forms and clears them when the reader comes back with the browser's back button.

## Labels
Say what is happening in the reader's words: "Searching the catalogue…", "Loading your account…", "Opening the record…". Set `data-aj-loading` on a link or form; search forms get "Searching the catalogue…" by themselves; anything else gets "Loading…" (جارٍ التحميل… on RTL pages).

## Artwork
Both rosette layers are traced from `rosette-motif.png` (99% match for the disc, 97% for the outlines) and inlined in the stylesheet, so the loader works on any server.

## Accessibility
The overlay is a polite live region, so the label is announced once. The bar is hidden from screen readers. Under reduced motion the rosette shows complete and still, and the bar jumps rather than glides.

## Tokens
`action`, `ornament`, `border-strong` (unfilled outline), `overlay`, `text-muted`, `duration-loader`, `duration-fast`, `duration-base`, `duration-slow`, `ease-in-out`, `z-loader`, `space-5`.
