The pill button for every action. Use a `button` for actions and an `a` for navigation, with the same classes.

## Anatomy
Pill container, label (sentence case, a verb: "Place hold", not "Submit"), optional 20px icon.

## Variants
- `aj-btn--primary`: `action` fill, `on-action` text. One per view, for the main action.
- `aj-btn--secondary`: `action-secondary` outline and text; fills on hover.
- `aj-btn--ghost`: text only, for toolbars and menus. Band fill on hover.
- `aj-btn--icon`: 44px circle for icon-only actions (shelf arrows). Needs `aria-label`.
- Sizes: default 46px, `--sm` 40px (hit area padded to 44px), `--lg` 52px, `--block` full width.

## States
- Hover: fill shifts to `action-hover` (`duration-fast`), devices with hover only.
- Pressed: scale 0.96 in `duration-instant`.
- Focus: 3px `focus-ring`, 2px offset.
- Disabled: `opacity-disabled`, no press feedback. Prefer `aria-disabled="true"` plus an explanation when the reason matters.
- Loading: add `.is-loading` (or call `Aljamea.busy(button, promise)`): spinner replaces the label, width stays, `aria-busy="true"`, repeat presses ignored.

## Accessibility
Native button semantics; Enter and Space activate. Text contrast 4.9:1 or better in both themes. Minimum target 44px.

## Tokens
`action`, `action-hover`, `on-action`, `action-secondary`, `on-action-secondary`, `surface-band`, `focus-ring`, `size-control*`, `radius-pill`, `space-4`/`space-6`, `duration-instant`, `duration-fast`, `ease-press`, `opacity-disabled`.

## Do / don't
- Do name the outcome: the toast after "Renew all" says "3 items renewed".
- Don't put two primary buttons side by side, or append "→" to labels.
