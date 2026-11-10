The main site header, in two tiers, after UCL Library Services' header.

## Anatomy
- **Top tier** (`.aj-masthead-top`, scrolls away): the large Aljamea logo (`size-logo-lg`) and utility links: Aljamea-tus-Saifiyah, Ask a librarian, and the language switch (عربي / English).
- **Library bar** (`header.aj-masthead`, sticky): the library's name, the section links, and the account menu.

## The scroll animation
When the top tier leaves the screen, the bar is marked `.is-stuck`:
- the small Aljamea logo (`size-logo-sm`) is revealed **from right to left**, the direction the calligraphy is written, over 600ms with `ease-in-out`;
- the library's name slides across by the logo's width over `duration-slow` with `ease-out`, so the two arrive together;
- the bar takes `shadow-nav`.
Scrolling back up reverses it, faster (`duration-fast`, `ease-in`). Only `transform`, `clip-path` and `opacity` animate.

UCL reveals its logo by stretching it out from the left. Arabic calligraphy shouldn't be stretched, so this one is uncovered at its true shape, in its own writing direction. On RTL pages the logo sits on the right and still reveals right to left.

## Behaviour
- `Aljamea.masthead()` (called by `init()`) watches the top tier with an IntersectionObserver: no scroll listeners.
- A page that opens already scrolled (reload, back) shows the stuck state at once, without animating.
- Section links underline from the reading-start edge; the current page keeps its underline and turns `text-heading`.
- On narrow screens the section links scroll sideways in one line, so the sticky bar stays short.
- The progress bar sits on the bar's bottom edge.
- Header and bar keep still during page transitions.

## Accessibility
The small logo is a duplicate of the top tier's, so it is `aria-hidden` and out of the tab order. The bar is the `header` landmark; the top tier's links are a separate labelled `nav`. Under reduced motion the logo fades in without the reveal and the name doesn't move. All targets are 44px.

## Tokens
`surface-page`, `border-subtle`, `border-strong`, `shadow-nav`, `text`, `text-heading`, `text-link`, `action`, `logo`, `size-logo-lg`, `size-logo-sm`, `size-target`, `space-1` to `space-6`, `duration-fast`, `duration-base`, `duration-slow`, `ease-in-out`, `ease-out`, `ease-in`, `z-sticky`.
