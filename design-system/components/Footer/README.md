The site footer: a sand band that closes every page, modelled on the UCL and Harvard library footers and on the footer band of the printed JDC cover.

## Anatomy
- **Rosette watermark:** the rosette in thin outline, oversized and cropped at the reading-start edge (it moves to the right in RTL), in `ornament` at 30% opacity (22% in dark). It echoes the large faint rosette behind the title of the printed JDC cover. It is a CSS mask on `.aj-footer::before`, so it needs no markup, sits behind the text, and is hidden in Windows high-contrast mode and in print.
- **Brand block:** the Aljamea logo (`.aj-logo`, so it follows the theme), the Arabic library name مكتبة الجامعة in `arabic-display`, the line "The Library of Aljamea-tus-Saifiyah" in `text-muted`, then address and email.
- **Link columns:** Visit, Catalogue, Aljamea. Each is a `nav` with an `h2` heading in sentence case (no uppercase labels) and 44px link rows.
- **Copper rule:** a full-width 3px `ornament` rule, our version of UCL's accent bar, separating the footer from its legal row.
- **Legal row:** Accessibility, Privacy, Cookies; the copyright line; Back to top.

## Behaviour
- Links underline by drawing a 1px line from the reading-start edge on hover (`duration-base`).
- Back to top scrolls smoothly (instantly under reduced motion) to the page's top anchor, and its arrow lifts 3px on hover.
- Four columns at desktop; the brand block takes a full row under 992px; one column under 576px, where the copyright drops onto its own line.

## Content
All links, the address and the email are placeholders: replace them with the library's real pages. Add social icons only for accounts the library actually runs.

## Accessibility
`footer` landmark; each column is a labelled `nav`. Text on `surface-band` is 7:1 or better in both themes. Every link is a 44px target.

## Tokens
`surface-band`, `border-strong`, `text`, `text-heading`, `text-muted`, `text-link`, `ornament`, `logo`, `font-arabic-display`, `font-ui`, `space-2` to `space-16`, `size-target`, `duration-base`.
