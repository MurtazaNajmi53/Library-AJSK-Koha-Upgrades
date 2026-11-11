# Library-AJSK-Koha-Upgrades

Customisations for the Koha catalogue of **Maktabat Aljamea (Sindh)**, the library of Aljamea-tus-Saifiyah, Karachi (library code AJSK). Koha 25.11.02 with Zebra. OPAC `library-karachi.jameasaifiyah.org` (behind Cloudflare), staff client `library-karachi-admin.jameasaifiyah.org`.

Nothing here modifies Koha's own code. Everything is delivered through system preferences (OPACUserCSS, OPACUserJS, SCOUserCSS, SCOUserJS, IntranetUserJS), HTML customizations, notices, reports and server config, so Koha upgrades stay safe.

## Layout

| Folder | What it holds |
|---|---|
| `design-system/` | The Maktabat Aljamea design system: tokens, components, fonts, brand assets, brand book. **Read `design-system/CLAUDE.md` and `design-system/README.md` before any visual or copy change.** |
| `opac/current/` | The OPAC and self-checkout front-end that is live now. `INSTALL.md` says what is pasted where. `*.css`/`*.js` are the documented masters, and `*.paste.*` are the comment-stripped copies made by `node build.js`. |
| `opac/legacy/` | Earlier versions, kept for reference and rollback. Don't edit. |
| `click-and-collect/` | Click & Collect (OPAC holds dialog, staff pull-list PDF, report 34 SQL, notices). Start with `00-project-log-status-rollback-and-migration.md`. |
| `server/plack/` | Plack runbook and commands. |
| `tests/opac-harness/` | Local harness that runs the OPAC CSS/JS against saved Koha pages (`fixtures/`). |
| `docs/` | Screenshots and design inspiration. |

## Working rules

- **Design.** Every user-facing change follows the design system: semantic tokens only, the 4.5:1 contrast and 44px target floor in light and dark, LTR and RTL, sentence case, no emoji, and motion that respects `prefers-reduced-motion`. From V5 the OPAC CSS uses the semantic tokens. The old `--aj-*` names survive only as aliases at the end of its section 1, because `SCOUserCSS_V1` and Click & Collect Part E still read them. Don't use them in new rules; map with the migration table in `design-system/README.md`.
- **Masters, then paste copies.** Edit the documented master (`OPACUserCSS_V6.css`, `OPACUserJS_V6.js`, …), then regenerate the `.paste.` copy. Never hand-edit a paste copy. Koha inlines these prefs on every page, so keep them lean.
- **Version, don't overwrite.** A new release of an OPAC file gets a new version suffix, and the previous one moves to `opac/legacy/`. Record what changed at the top of the master file.
- **Record live changes.** Any change made in Koha's admin goes into the relevant project log, with the old value, so it can be rolled back.
- **No secrets.** Never commit passwords, API keys, patron data or exports with personal information.

## Commands

```bash
node opac/current/build.js                    # regenerate OPAC paste copies (needs terser)
node design-system/scripts/build.mjs          # regenerate design-system/tokens.css
node design-system/scripts/build.mjs --check  # fail if tokens.css is stale
python3 -m http.server 8000 --directory design-system   # component gallery at /gallery.html
```
