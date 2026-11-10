A dropdown list of links or actions, opened by a button. Provide the trigger (`data-aj-menu`, `aria-controls`, `aria-expanded="false"`) and a `ul.aj-menu` with that id.

## Behaviour
- Opens on click, Enter, Space or ArrowDown (which focuses the first item); scales from 0.96 and fades in `duration-base`.
- Closes on Escape (focus returns to the trigger), Tab, or a click outside; leaves in `duration-fast`.
- ArrowUp, ArrowDown, Home and End move between items.
- Opens from the inline-end edge of its trigger; in RTL from the left.

## Anatomy
Raised surface, 4px padding, 44px items with `radius-xs` (concentric with the menu's `radius-md`), optional separator, optional strong item (log out).

## Accessibility
This is a disclosure menu of links, so it uses list semantics rather than `role="menu"`. Trigger reports `aria-expanded`.

## Tokens
`surface-raised`, `shadow-raised`, `border-subtle`, `surface-band`, `radius-md`, `radius-xs`, `size-target`, `z-menu`, `duration-base`, `duration-fast`, `ease-out`, `ease-in`.
