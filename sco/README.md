# Self-checkout kiosk

The Koha self-checkout screen (`sco-main.pl`) on the library's kiosks:
21-inch screens, mounted portrait, touch input.

| File | Paste into |
|---|---|
| `current/SCOUserCSS_V1.paste.css` | Administration › System preferences › **SCOUserCSS** |
| `current/SCOUserJS_V1.paste.js` | Administration › System preferences › **SCOUserJS** |

The `.css` and `.js` files are the documented masters; the `.paste.` copies are
made from them by `node opac/current/build.js`, which builds the OPAC and the
kiosk together. Never edit a paste copy by hand.

The kiosk is versioned on its own (it changes far less often than the OPAC).
It still depends on the OPAC: Koha also loads OPACUserCSS and OPACUserJS on
the kiosk. SCOUserCSS reads the OPAC stylesheet's `--aj-*` aliases (section 1
of OPACUserCSS), OPACUserCSS section 17 switches the OPAC furniture off here,
and OPACUserJS stops itself at the top on this screen.
