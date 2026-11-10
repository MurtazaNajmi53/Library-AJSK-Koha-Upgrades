A list of upcoming events, each dated with the day inside the rosette's ring, the way verse numbers sit in rosettes in a manuscript.

## Anatomy
- **Date:** the Gregorian day inside the ring (`.aj-event__day`), the month under it (`.aj-event__month`, `text-accent`), then the Hijri date (`.aj-event__alt`, `text-muted`). Wrap the day and month in `<time datetime="YYYY-MM-DD">`. The day is display 700 with tabular figures and never mirrors.
- **Ring:** the line rosette masked to its outer ring and petal tips, in `ornament`, so the number stays clear. Decoration only: the date is always in words and numbers.
- **Details:** the title (`h3`, the link), the kind of event in `text-muted`, then time and place as meta rows with icons.

## Hijri dates
Write the Hijri date as text, the way the library writes it (for example "2 Jumada al-Ukhra"). Wrap a hyphenated month part in a `span` (`2 Jumada <span>al-Ukhra</span>`) so it never breaks at the hyphen. The component doesn't calculate it, so check the date against the Dawat calendar, which can differ by a day from other tabular or sighted calendars.

## Behaviour
- The whole row is the link (`.aj-clickable`). On hover the title underlines and the ring takes the `action` colour. The ring doesn't move.
- Focus shows the closing ring described in Card.

## Layout
Not boxed: a rule above each event. Rows sit side by side, at least 17.5rem wide each, so three across on a wide page.

## Tokens
`ornament`, `action`, `text-heading`, `text-accent`, `text-muted`, `border-subtle`, `focus-ring`, `duration-fast`.
