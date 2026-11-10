One record in the results list.

## Anatomy
Select box (44px), a 76px cover (decorative, so hidden from screen readers and the tab order; the title is the link), a meta line (position and a type badge), the title, authors, year, availability pills, and three quick actions (Save, Cite, Copy link).

## Type
- Latin titles: the `title` display style in `text-link`.
- **Arabic and LSD titles and authors use Kanz-al-Marjaan** (`result-title-ar`, `result-author-ar`), the one place the system uses it, on English and Arabic pages alike. Set `lang="ar" dir="rtl"` on the title and author. Kanz-al-Marjaan is installed on Apple devices; elsewhere it falls back to Amiri, which covers every LSD letter (Tajawal does not, so it is never used here).

## States
- Availability: **Available** (filled dot, `text-accent`), **On loan, due …** (hollow dot, `text-muted`), **Online** (`text-heading`). The state is always in words.
- Save toggles (`aria-pressed`) and fills its icon in `action`.
- Quick actions show a tooltip after 300ms of hover or on keyboard focus.
- The row takes a faint band fill on hover; there is no lift, because the card itself isn't a link.
- On phones the cover hides and actions move under the text.

## Tokens
`text-link`, `text-accent`, `text-muted`, `text-heading`, `surface-band`, `surface-inverse` (tooltip), `border-subtle`, `font-display`, `font-arabic-results`, `size-target`, `radius-md`, `duration-fast`.
