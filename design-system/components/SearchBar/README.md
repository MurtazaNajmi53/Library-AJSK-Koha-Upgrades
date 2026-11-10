The main catalogue search: scope, terms and a primary Search button on `surface-band`, full width under the header.

## Anatomy
`form.aj-search[role=search]` > `.aj-search__row` (select, field, button) + `ul.aj-search__more` of secondary links.

## Behaviour
Fields are 46px; links are 44px tall targets. The band carries `view-transition-name: aj-search` so it stays still between pages. On submit the page loader may show after 300ms.

## Accessibility
Visually hidden labels for select and field. Placeholder is a hint, not the label.

## Tokens
`surface-band`, `border-strong`, `border-control`, `action`, `text-link`, `space-2`, `space-4`, `space-5`, `size-control`, `radius-md`, `radius-pill`.

## Don't
Put this band on the login page, or add a second primary button to it.
