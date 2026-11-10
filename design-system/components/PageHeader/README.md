The compact single-bar header with the Aljamea logo, library name, main links and the account menu. Use it where the full two-tier Masthead doesn't fit: the login page, kiosk screens, embedded pages.

## Anatomy
Logo (`.aj-logo`: the Aljamea SVG drawn in the `logo` token, so it is heading blue in light and periwinkle in dark), library name in display weight and the same colour, `nav` with links and a menu trigger.

## Behaviour
- Sticky at the top with `shadow-nav`; `z-sticky`.
- Links underline from the reading-start edge on hover (`duration-base`), and stay underlined for `aria-current="page"`.
- Account menu: see Menu.
- Carries `view-transition-name: aj-header`, so it does not move during page transitions.
- Under 700px the logo drops to `size-logo-sm` (40px) and links wrap below the brand.

## Accessibility
`header` landmark and `nav aria-label="Main"`. Logo `alt` names the institution. Links are 44px tall.

## Tokens
`surface-page`, `shadow-nav`, `logo`, `text-heading`, `action`, `action-hover`, `size-logo`, `size-logo-sm`, `size-target`, `space-3`, `space-6`, `z-sticky`, `duration-base`.
