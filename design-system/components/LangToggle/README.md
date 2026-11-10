A two-way language switch: English | العربية. The thumb slides to the language you pick; then the page changes language behind a wipe that travels in the new reading direction, right to left into Arabic and left to right into English.

## Anatomy
A pill track (`surface-band`, `border-strong`) holding two links and a white thumb. Each label is set in its own language and script: "English" in DM Sans, "العربية" in Tajawal. The current language has `aria-current="true"`.

## Behaviour
- The thumb slides in 380ms (`ease-in-out`); the chosen label turns `text-heading`.
- **In Koha:** the links point to the other language's page (`?language=ar`). The script waits for the thumb, then navigates; the new page is revealed by a wipe in its reading direction over 620ms. For the wipe, load `bundle.js` in the `<head>` without `defer`, so it can tag the page transition (browsers without cross-document View Transitions simply load the page).
- **In-page:** `Aljamea.lang(el, { onChange })` switches inside a View Transition with the same wipe, as this card does.
- The control never mirrors: English stays on the left, Arabic on the right, in both directions, so the thumb ends where the reader is already looking.
- The masthead and search band don't take part in the wipe, so nothing jumps.

## Accessibility
A labelled group of two links with `lang` and `hreflang`, so screen readers pronounce each label in its own language. Both are 44px targets. Under reduced motion the thumb moves instantly and the page changes without a wipe.

## Tokens
`surface-band`, `surface-card`, `border-strong`, `border-subtle`, `shadow-card-hover`, `text-muted`, `text-heading`, `font-ui`, `font-arabic-ui`, `radius-pill`, `duration-base`, `ease-in-out`.
