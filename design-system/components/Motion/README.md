The motion system: what moves, how fast, and when it stays still. Motion here answers something the reader did (press, open, add, wait); nothing moves on its own except the loader and one entrance per visit.

## Rules
- **Press:** every button, pager item and cover link scales to 0.96 in `duration-instant` with `ease-press`, and returns when released. Never smaller than 0.95.
- **Hover:** colour and shadow only, in `duration-fast`, and only on devices that can hover (`@media (hover: hover)`), so touch screens never get stuck states.
- **Open and close:** things that enter use `ease-out` and `duration-base`; things that leave use `ease-in` and `duration-fast`. Leaving is always quicker than arriving.
- **Feedback:** toasts rise 12px and fade in `duration-slow`; errors rise into place; loading swaps the label for a spinner without changing width.
- **Page:** pages cross-fade with a 10px lift (see PageTransition). The home grid rises in once per visit (`.aj-stagger`). That is the one orchestrated moment.
- **Wait:** every page change gets the progress bar; a wait over 1.2s brings in the rosette, which draws its petals one by one and fills, with a label saying what is happening.
- Name the properties you animate (`transition-property: background-color, transform`). Never `transition: all`.
- Animate `transform` and `opacity` only, so motion stays on the compositor. The tab indicator is the one exception (it moves `inset-inline-start`).

## Reduced motion
Under `prefers-reduced-motion: reduce`, `--aj-shift` becomes 0, so every movement multiplies to nothing; fades shorten to `duration-instant`; the loader and skeleton stop; page transitions are off; smooth scrolling is off. State changes still show, just without travel.

## Tokens
`duration-instant` 90ms, `duration-fast` 150ms, `duration-base` 220ms, `duration-slow` 320ms, `duration-loader` 1600ms; `ease-out`, `ease-in`, `ease-in-out`, `ease-press`.

## Don't
- Fade-and-slide every section as it scrolls into view.
- Add hover lifts to cards that are not links.
- Animate width, height or margin (the disclosure uses `interpolate-size`, which the browser optimises).
