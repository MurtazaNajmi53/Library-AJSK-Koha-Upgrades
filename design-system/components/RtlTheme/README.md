Right-to-left pages for Arabic and LSD. It combines with either colour theme: set `dir="rtl"` and `lang="ar"`, plus `data-theme` as usual.

## Layout
Mirrors by itself: components use logical properties (`margin-inline-end`, `inset-inline-start`, `text-align: start`), flex and grid. Menus open from the left, the nav underline grows from the right, tab arrow keys and shelf arrows reverse. Do not write mirrored copies of rules.

## Type
The RTL styles in tokens.json follow English, which is all DM Sans: **Tajawal** (`arabic-display`, `arabic-ui`) sets headings, the masthead name, section links, menus, tabs and everything else (body `rtl-body` 1.0625rem with 1.8 line height, buttons, labels, forms). Smallest Arabic size is `rtl-caption`, 14px. **Amiri** (`arabic-passage`) sets only passages: Quran, hadith and iqtibasaat in `.aj-passage`. Never track or uppercase Arabic (it breaks joined letters).

## Fonts
Amiri and Tajawal ship as files. Their files hold Arabic only, so digits and Latin names inside Arabic text fall through to DM Sans. **LSD:** Amiri covers every LSD letter tested (ڇ ڻ ٺ ڏ ڍ ڙ ڳ ڱ ھ ے ٹ ڈ ڑ گ چ پ); Tajawal covers almost none of them (it has پ only), so LSD text belongs in search results (Kanz-al-Marjaan, then Amiri) or in Amiri. Don't set LSD in Tajawal.

## Mixed text
Wrap Latin names, call numbers and codes in `<bdi>`, or rely on `unicode-bidi: plaintext` (titles and authors already have it). Mirror directional icons with `.aj-flip`; never mirror the logo, the rosette, numbers or clocks.
