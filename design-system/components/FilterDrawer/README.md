The Filters pull-out: every filter group in a drawer that slides in from the reading-start edge (left in English, right in Arabic) over a dimmed page.

## Anatomy
Head (`h2` "Refine results" and a close button), a scrolling body of Facets-style disclosures with check rows and counts, and a fixed foot with **Clear all** and a primary **Show N results** that updates as you tick.

## Behaviour
- Built on `<dialog>` opened with `showModal()`: focus moves inside and stays there, Escape closes, the page behind is inert. A click on the dimmed page or any `[data-aj-close]` closes it, and focus returns to the Filters button.
- Slides in over `duration-slow` (`ease-out`), out over `duration-base` (`ease-in`); the scrim fades. Under reduced motion it appears without sliding.
- Full width on phones; 420px otherwise.
- Group bodies open and close with the animated disclosure; counts use tabular figures.

## Tokens
`surface-raised`, `shadow-raised`, `scrim`, `border-subtle`, `surface-band`, `action-secondary`, `size-target`, `space-2` to `space-6`, `duration-base`, `duration-slow`, `ease-out`, `ease-in`.
