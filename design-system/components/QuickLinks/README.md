A short list of the places readers go most, each with one line saying what is behind the link.

## Anatomy
Each row: the title (`h3`, the link, display 600 in `text-heading`), a 20px chevron in `action` at the reading end (mirrors in RTL with `.aj-flip`), and one line of description. A 1px `border-subtle` rule under each row. Two columns from 768px, one below.

## Behaviour
- The whole row is the link (`.aj-clickable`). On hover the title underlines and the chevron moves 4px toward the reading end. No movement under reduced motion.
- Focus shows the closing ring described in Card.

## Content
Name the place, not the action ("Plan a visit", "Your account"). Keep the description to one sentence. Use a chevron icon, never "→" after the label. Four to six links.

## Tokens
`text-heading`, `text`, `action`, `border-subtle`, `focus-ring`, `duration-fast`.
