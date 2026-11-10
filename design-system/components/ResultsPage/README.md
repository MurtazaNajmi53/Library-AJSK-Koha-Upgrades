The search results page, after UCL's Primo: the filters people use most are one tap away as chips; everything else waits behind two pull-out buttons, so the results lead.

## Anatomy
- **Heading:** the query in `h1`, and a live result count.
- **Bar:** a **Filters** button (with a count badge) that opens the FilterDrawer; **quick filter chips** for the main filters (Available now, Arabic, Lisan al-Dawat, Manuscripts); a **Sort** pull-out (Relevance, Title A to Z, Newest, Oldest) at the inline end.
- **Applied filters:** each active filter as a tag you can remove with one press.
- **Results:** SearchResult cards; an Alert with "Clear all filters" when nothing matches.

## Behaviour
- Chips and drawer checkboxes are the same filters: change one and the other follows. The badge on Filters counts them.
- Filters in the same group widen the search (Arabic or English); filters in different groups narrow it (Arabic and Manuscripts).
- Each change re-renders the list inside a View Transition. Every card has its own `view-transition-name`, so results that stay slide to their new place, new ones fade in and removed ones fade out.
- In the drawer, counts beside each filter show what you would get, and the main button says "Show 5 results".
- Saving a record flips its bookmark and confirms with a toast that has Undo.

## In Koha
Chips and drawer options are links to faceted searches (Koha's `limit=` parameters) rather than client-side filters, and Sort links to `sort_by=`. Keep the same markup and classes; the page reloads, and the page transition does the animating.

## Accessibility
Chips are toggle buttons (`aria-pressed`) in a labelled group. Sort is a menu of `menuitemradio` items. The count is a polite live region. The drawer is a modal dialog. Every control is a 44px target.

## Note
The records are sample data for the demo: real titles, illustrative years and loan dates.

## Tokens
`surface-band`, `surface-card`, `border-subtle`, `border-strong`, `action`, `action-secondary`, `text-heading`, `text-muted`, `scrim`, `font-display`, `font-arabic-results`, `size-control-sm`, `size-target`, `radius-pill`, `duration-base`, `duration-slow`.
