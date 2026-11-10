A clickable card for collections, guides and news on the home page and content pages, plus a navy feature card that leads a section.

## Anatomy
- **Card (`.aj-card`):** `surface-card`, one even 1px `border-subtle`, `radius-md`, `shadow-card`. No top rule. Optional media on top (3:2), then a body with an optional kind chip (`.aj-card__kind`, sentence case), the title (`h3`, display 600), a summary and optional meta rows.
- **Media:** a photograph, or, when there is none, generated BookCovers in `.aj-card__covers`. Never a stock photo.
- **Feature card (`.aj-card--feature`):** `surface-feature` ground, `text-on-inverse` text, meta in `text-on-inverse-muted`, and a 44px go button (`.aj-card__go`) in the reading-end corner. Use one per section at most.
- **Watermark:** the feature card's body carries the rosette in hairline outline, oversized and cropped at the reading-end corner, in `ornament` at 30% (24% in dark), as on the footer and the printed JDC cover. It is a CSS mask on `.aj-card__body::before`: no markup, behind the text, still, and hidden in high-contrast mode and print. Only the feature card has it.
- **Meta rows:** each fact on its own row with a 20px icon (clock, pin). Never an "A · B · C" string.

## Whole-card link
Add `.aj-clickable` to the card and `.aj-clickable__link` to the title link. The link stretches over the card, so the whole card is the target and screen readers hear one link named by the title. Any other link or button inside the card stays clickable on its own. The go button is `aria-hidden`, because the title is already the link. A clickable card blocks text selection, so don't use it for content people copy from.

## Focus
The card's emphasis is its focus state, not decoration. On keyboard focus a 3px `focus-ring` ring fades in and closes from 103% to its place, 2px outside the card, with corners concentric to the card's (`radius-md` plus the gap). It enters over `duration-base` with `ease-out` and leaves over `duration-fast` with `ease-in`. Only `transform` and `opacity` animate. Under reduced motion it doesn't scale and fades in `duration-instant`, but it still appears. Browsers without `:has()` keep the ring on the title link. The ring is 10.2:1 on the light page and 9.4:1 on the dark page.

The same `.aj-clickable` ring works on EventList, QuickLinks and Promo. Set `--aj-ring-gap` (default 5px, 6px on bordered cards) and `--aj-ring-radius` to fit.

## Behaviour
- Hover (devices that hover): the card lifts 3px with `shadow-card-hover`, the title underlines, and the go button fills with `action`.
- Press: the card scales to 0.98 in `duration-instant`.

## Layout
`.aj-card-grid`: three across from 992px, two from 768px, one below, with `space-6` gaps.

## Don't
Put links inside a feature card's text (the focus ring would sit on navy). Show more than one feature card or watermark on a page. Add a top rule or accent bar.

## Tokens
`surface-card`, `surface-feature`, `surface-band`, `border-subtle`, `border-control`, `text-heading`, `text-on-inverse`, `text-on-inverse-muted`, `text-muted`, `action`, `on-action`, `focus-ring`, `ornament`, `shadow-card`, `shadow-card-hover`, `radius-md`, `radius-xs`, `size-target`, `duration-fast`, `duration-base`, `duration-instant`.
