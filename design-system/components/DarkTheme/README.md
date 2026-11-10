The dark theme maps the same semantic tokens to night values, so every component works unchanged. Set `data-theme="dark"` on the page or any wrapper.

## What changes
`surface-page` navy, `surface-card` a lighter navy, `surface-raised` lighter still; `text` cream; `text-heading` and `text-link` periwinkle; `action` a lighter gold with navy `on-action` text. Shadows become deeper and add a faint white ring, so cards keep an edge the fill step alone cannot give.

## Rules
- The logo follows the theme by itself: `.aj-logo` is filled with the `logo` token (periwinkle here). No second file.
- Use the `on-` tokens for text on fills; never hard-code white.
- Images get a 10% white outline instead of black.
- Every text pair is 4.5:1 or better; most are 7:1 or better.

## Respecting the reader
To follow the system setting, set `data-theme` from `prefers-color-scheme` on load, and let the reader override it.
