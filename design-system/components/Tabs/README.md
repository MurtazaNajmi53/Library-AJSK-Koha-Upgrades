Tabs for the record page sections (holdings, notes, comments). Provide `role="tablist"` buttons with `aria-controls`, and matching `role="tabpanel"` elements; add `data-aj-tabs` to the wrapper.

## Behaviour
The copper indicator slides to the selected tab (`duration-base`, `ease-in-out`), without sliding on first paint. Panels fade in. Arrow keys follow reading direction (reversed in RTL); Home and End jump to the ends. Only the selected tab is in the tab order.

## Tokens
`action` (indicator), `text-link`, `text`, `border-strong`, `size-target`, `space-4`, `space-5`, `duration-base`.

## Don't
Use tabs for steps in a sequence (use NumberedSteps) or for more than five sections.
