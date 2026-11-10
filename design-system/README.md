Use this system for anything that carries the name Maktabat Aljamea, or  Maktabat Aljamea (Sindh), the library of Aljamea-tus-Saifiyah, Karachi: the Koha OPAC, printed covers and teaching slides. It is calm and bilingual: cream ground, navy text, copper actions, Arabic and LSD beside English, and motion that answers the reader rather than performing.

## Using it

Load, in order: `tokens.css` (with the fonts), `components/bundle.css`, `components/bundle.js`, then call `Aljamea.init()`. Wrap content in an element with class `aj`. In Koha, the stylesheet goes in OPACUserCSS and the script in OPACUserJS. `Aljamea.loader.bind()` turns on the progress bar and rosette loader for links and forms. Every component card shows its markup.

## Themes

Two independent switches.

- **Colour:** `light` (default) and `dark`, set with `data-theme` on the page or any wrapper. Components use semantic tokens only, so nothing else changes. To follow the device, set `data-theme` from `prefers-color-scheme` on load and let readers override it.
- **Direction:** LTR and RTL. Arabic and LSD pages set `dir="rtl"` and `lang="ar"`; layout mirrors by itself and the RTL type styles apply. See RtlTheme. Readers switch with the LangToggle (English | العربية) in the masthead: the thumb slides, then the page wipes in the new reading direction.
- **Logo:** use `<span class="aj-logo" role="img" aria-label="Aljamea-tus-Saifiyah">`. It draws the Aljamea SVG in the `logo` token, so it is heading blue (`blue-700`) in light and periwinkle (`periwinkle-300`) in dark, matching the library name beside it, from a single file. It stays visible in Windows high-contrast mode and prints in colour.

## Tokens

Colour has two tiers. **Palette** tokens are raw brand values with plain names (`copper-600`, `navy-900`); they never change between themes. **Semantic** tokens name a job (`surface-card`, `text-muted`, `action`) and point to a palette token per theme. Components and pages use semantic tokens only. Never use a palette token or a hex value in a component.

| Job | Token |
|---|---|
| Grounds | `surface-page`, `surface-card`, `surface-raised` (menus, toasts), `surface-band` (search band, table heads, hover), `surface-inverse` |
| Text | `text`, `text-muted`, `text-heading`, `text-link`, `text-link-hover`, `text-accent`, `text-on-inverse` |
| Actions | `action`, `action-hover`, `on-action`, `action-secondary`, `on-action-secondary` |
| Lines and marks | `border-subtle`, `border-strong`, `border-control`, `focus-ring`, `ornament`, `logo` |

Other families: spacing on a 4px scale (`space-1` 4px to `space-16` 64px, plus `gutter`), `size-*` (controls 40, 46 and 52px, targets 44px, line length 68ch), radius (`radius-sm` 4, `radius-xs` 6, `radius-md` 10, `radius-lg` 14, `radius-pill`), shadows, `duration-*`, `easing`, `z-*` and `opacity-*`.

### Moving from the OPAC stylesheet

| OPACUserCSS (`--aj-*`) and version 1 name | Use now |
|---|---|
| `cream` | `surface-page` |
| `white` | `surface-card` or `surface-raised` |
| `sand` | `surface-band` |
| `sand-line` | `border-strong` |
| `hairline` | `border-subtle` |
| `field-line` | `border-control` |
| `ink` | `text` (or `surface-inverse` when it was a ground) |
| `muted` | `text-muted` |
| `blue` | `text-heading`, `text-link`, `action-secondary` or `focus-ring`, by job |
| `copper` | `ornament` |
| `copper-deep` | `action` |
| `copper-dark` | `action-hover` or `text-accent` |
| `rosette-gold` | `brand-gold` |
| `--aj-radius` / `--aj-pill` | `radius-md` / `radius-pill` |

## Content fundamentals

- Plain, direct English, with a polished yet accessible tone and register.
- Sentence case for titles, buttons, tabs and labels. The library's name keeps its capitals.
- Buttons name the outcome ("Place hold", "Renew all"), and the confirmation repeats it ("Hold placed", "3 items renewed"). No "Submit", no "→" after labels.
- Errors say what happened and what to do, without apology: "That password doesn't match this card. Please check the password or reset it.."
- Eyebrows only give a position in a sequence ("Step 2 of 4"), in sentence case. No uppercase labels, and no "A · B · C" strings of metadata.
- Titles of honour follow the name in capitals with no full stops: Syedna TUS, Imam Husain AS, Rasul Allah SAW. The possessive sits on the name: "Rasul Allah's SAW passing". LSD words (zikr, waʿz, raza) are italic (DM Sans has a true italic); names of people, places and books are not.
- Arabic stays on its own line in a passage block (`.aj-passage`), with the English on the next line.
- No emoji, no exclamation marks.

## Visual foundations

- **Colour:** `surface-page` ground; `surface-card` for cards and fields; `surface-band` for bands and hover. Headings and links in `text-heading`/`text-link`; actions in `action`. Copper text on a band uses `text-accent`. `ornament` is decoration only (2.75:1 on cream).
- **Type:** one Latin family, **DM Sans**, used in two roles. `display` carries the voice: headings, the masthead name, section links, menu items, tabs, footer headings and record titles, at weight 600 to 700 with negative tracking (-0.005em on navigation to -0.03em on the largest figures). `ui` does the work: body text, buttons, labels, forms, meta. DM Sans is variable with an optical-size axis, so headings get its tighter display cut automatically (`font-optical-sizing: auto`). Arabic follows: **Tajawal** for headings, navigation and text alike (`arabic-display`, `arabic-ui`). **Amiri** (`arabic-passage`) is kept for Quran, hadith and iqtibasaat passages, and **Kanz-al-Marjaan** (`arabic-results`) only for Arabic and LSD titles and authors in search results. Printed covers use DM Sans too, at weight 750 with tight tracking. The scale is in tokens.json; the smallest text is 13px (`caption`), 14px for Arabic. Running text stops at 68ch. Headings balance their lines; paragraphs avoid orphans. Changing numbers use tabular figures.
- **Fonts:** all faces ship as woff2 files under `fonts/` (SIL Open Font License 1.1), except Kanz-al-Marjaan, which is installed on Apple devices and falls back to Amiri elsewhere. DM Sans ships as two variable files (upright and italic, Latin and Latin Extended). It has ā ī ū but no dotted transliteration letters (ḍ ṣ ḥ ṭ ẓ) and no ʿayn sign (ʿ), so those fall back to a system font: write transliterated names without them in headings, or accept the mixed glyph. Amiri covers every LSD letter checked (ڇ ڻ ٺ ڏ ڍ ڙ ڳ ڱ ھ ے ٹ ڈ ڑ گ چ پ ٿ ڦ ڄ ڃ ٻ ڀ ۓ ۀ). Tajawal lacks 23 of them, so never set LSD in Tajawal: LSD belongs in search results (Kanz-al-Marjaan, then Amiri) or in a passage (Amiri). Tajawal has no 600 weight: Arabic labels and menus use 500, headings and buttons 700.
- **Shape:** buttons, pills and pager items are pills; fields, menus and cards `radius-md`; login card and action bar `radius-lg`; covers `radius-sm`. Nested corners stay concentric: a menu's 4px padding plus its items' `radius-xs` equals the menu's `radius-md`.
- **Depth:** cards are nearly flat (`shadow-card`) with a 3px `ornament` top rule. Shadows grow only for things that float (`shadow-raised`) or respond to hover (`shadow-card-hover`). In dark, shadows add a faint white ring so edges stay visible.
- **Header and footer:** every page opens with the two-tier Masthead (large Aljamea logo and utility links above a sticky library bar; when the bar pins, the small logo writes itself in right to left) and closes with the sand Footer (Arabic library name, link columns, copper rule, legal row and Back to top).
- **Layout:** side padding is `clamp(16px, 3.5vw, gutter)`. The home grid shows new arrivals, account and news three across from 992px, two from 768px, one below. Results and records are not boxed; rules separate them.
- **Imagery:** the rosette is the only ornament: on covers, the loader and empty states. Records without an image get the generated BookCover, never a stock photo. Cover images get a 10% black outline (10% white in dark).

## Motion

Motion shows what changed after the reader acts. It is never decoration.

- **Press:** buttons, pager items and cover links scale to 0.96 in `duration-instant`.
- **Hover:** colour and shadow in `duration-fast`, only on devices that hover. Cover links lift 3px. Nav links underline from the reading-start edge.
- **Open and close:** menus scale and fade in over `duration-base` and leave in `duration-fast`; disclosures animate their height; tab indicators slide; panels fade in.
- **Feedback:** toasts rise in `duration-slow` and leave on their own after 5s; errors rise into place; loading buttons keep their width.
- **Pages:** View Transitions cross-fade pages with a small lift while the header and search band stay still; a cover morphs from results to record. The home grid rises in once per visit.
- **Waiting:** every page change shows a 3px progress bar on the header's edge; a wait longer than 1.2s brings in the rosette loader, which draws its petals one by one, fills with copper, and says what is happening ("Searching the catalogue…"). Skeletons pulse slowly.
- Enter with `ease-out`, leave with `ease-in`, and leave faster than you arrive. Animate `transform` and `opacity`; name every property you transition.
- **Reduced motion:** all movement drops to zero, fades shorten to `duration-instant`, the rosette shows complete and still, skeletons stop, the progress bar jumps instead of gliding, page transitions turn off. State still changes visibly.

## Accessibility floor

Text is 4.5:1 or better on every surface it sits on, in both themes (most pairs 7:1). Every interactive target is at least 44px. Focus is a 3px solid `focus-ring` with a 2px offset, never removed. Menus, tabs and the shelf work from the keyboard. Status is never shown by colour alone. Forms use visible labels and linked error messages.

## Iconography

The OPAC uses Koha's Font Awesome glyphs in `action`. New icons are simple 2px-stroke SVGs drawn in `currentColor` at 20px (chevrons, info). Directional icons mirror in RTL with `.aj-flip`; logos, the rosette and numbers never do. No emoji.

## Assets

- `assets/Brand`: the Aljamea logo (blue and cream), rosette motif, rosette mark, and the cream Arabic wordmark.
- `assets/Print`: the JDC cover, the reference for printed covers.
- `assets/Email`: the email template, three filled examples and the PNG logos mail apps need.
- `assets/Source`: the live OPAC stylesheet. Read the migration table above before changing it to use these tokens.

## Components

Foundations: Motion, PageTransition. Actions: Button. Forms: Field, SearchBar. Navigation: Masthead (the main header), PageHeader (compact header), LangToggle, Menu, Breadcrumbs, Tabs, Pagination. Catalogue: ResultsPage, FilterDrawer, SearchResult, BookCover, RecordDetail, Shelf. Home: Panel, StatusList, NewsList. Feedback: Alert, Toast, Loader, Skeleton. Content: NumberedSteps, Callout, DataTable. Pages: LoginForm, Footer, EmailTemplate (conference mail and Koha notices). Themes: DarkTheme, RtlTheme.

