A 2:3 book cover. When a record has an image, show it; when not, generate one from the title and author so every result has a cover.

## Anatomy
Sand plate, copper hairline frame inset 6px, copper ring above the title, title (4 lines max) and author (2 lines max). Images sit on top with a 10% black outline (10% white in dark).

## Sizes
100px in results, 116px on shelves, 200px on the record page, 140px on phones. Set `--aj-cover-w` to change.

## Behaviour
Wrapped in `.aj-cover-link`, it lifts 3px with a deeper shadow on hover and presses to 0.97. Give it `view-transition-name: cover-<id>` to morph into the record page.

## Accessibility
Wrapped link gets `aria-label` with the title. Images are decorative (`alt=""`) when the title is next to them. Titles use `unicode-bidi: plaintext` so Arabic reads correctly.

## Tokens
`surface-band`, `ornament`, `text-heading`, `text-muted`, `shadow-cover`, `shadow-card-hover`, `radius-sm`, `size-cover-w`, `duration-base`.
