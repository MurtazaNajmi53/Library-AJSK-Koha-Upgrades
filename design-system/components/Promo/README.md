One wide picture and a sand panel, to point readers at a single service or campaign.

## Anatomy
A picture on the reading-start side (7 parts) and a `surface-band` panel (5 parts): the title (`h3`, display 700, the link), one or two sentences (stops at 68ch) and a primary-button cue that names what happens ("See how it works"). The cue is `aria-hidden`, because the title is already the link. 1px `border-subtle`, `radius-md`. Stacks below 768px with the picture on top.

## Behaviour
- The whole promo is the link (`.aj-clickable`). On hover the title underlines and the cue darkens to `action-hover`. It doesn't lift: large blocks that jump feel heavy.
- Focus shows the closing ring described in Card.

## Don't
Rotate several promos in a carousel. Use a stock photo. Add the rosette watermark here: it belongs to the feature card only, so a page never shows two.

## Tokens
`surface-band`, `border-subtle`, `text-heading`, `text`, `action`, `action-hover`, `on-action`, `focus-ring`, `radius-md`, `size-measure`.
