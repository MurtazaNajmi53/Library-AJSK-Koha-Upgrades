# Library-AJSK-Koha-Upgrades

Customisations for the Koha catalogue of **Maktabat Aljamea (Sindh)**, the library of Aljamea-tus-Saifiyah, Karachi (library code AJSK). Koha 25.11.02 with Zebra. OPAC `library-karachi.jameasaifiyah.org` (behind Cloudflare), staff client `library-karachi-admin.jameasaifiyah.org`.

Nothing here modifies Koha's own code. Everything is delivered through system preferences (OPACUserCSS, OPACUserJS, SCOUserCSS, SCOUserJS, IntranetUserJS), HTML customizations, notices, reports and server config, so Koha upgrades stay safe.

## Layout

| Folder | What it holds |
|---|---|
| `design-system/` | The Maktabat Aljamea design system: tokens, components, fonts, brand assets, brand book. **Read `design-system/CLAUDE.md` and `design-system/README.md` before any visual or copy change.** |
| `opac/current/` | The OPAC front-end. `INSTALL.md` says what is pasted where. `*.css`/`*.js` are the documented masters, and `*.paste.*` are the comment-stripped copies made by `node build.js`. `reports/` holds the SQL of reports the OPAC reads. |
| `opac/click-and-collect/` | Click & Collect: staff pull-list PDF (IntranetUserJS), report 34 SQL, notices, project log. Its OPAC code is Part E of `OPACUserJS`. Start with `00-project-log-status-rollback-and-migration.md`. |
| `opac/legacy/` | Earlier OPAC releases, kept for reference and rollback. Don't edit. |
| `sco/current/` | The self-checkout kiosk (SCOUserCSS, SCOUserJS). Versioned on its own; built by the same `build.js`. |
| `server/plack/` | Plack runbook and commands. |
| `tests/opac-harness/` | Local harness that runs the OPAC CSS/JS against saved Koha pages (`fixtures/`). |
| `docs/` | Screenshots and design inspiration. |

## Working rules

- **Design.** Every user-facing change follows the design system: semantic tokens only, the 4.5:1 contrast and 44px target floor in light and dark, LTR and RTL, sentence case, no emoji, and motion that respects `prefers-reduced-motion`. From V5 the OPAC CSS uses the semantic tokens. The old `--aj-*` names survive only as aliases at the end of its section 1, because `SCOUserCSS_V1` and Click & Collect Part E still read them. Don't use them in new rules; map with the migration table in `design-system/README.md`.
- **One release number for the OPAC.** Every installable file under `opac/` (`opac/current/*`, `opac/current/reports/*`, the `_V…` files in `opac/click-and-collect/`) carries the same release number in its name and header, e.g. `_V8.1`. Any change to any of them is a new release: every file is renamed to the new number, the previous release's changed files move to `opac/legacy/v<release>/`, and INSTALL.md lists what changed. Report SQL can't have a header comment (Koha needs it to start with `SELECT`), so only its filename carries the number.
- **Masters, then paste copies.** Edit the documented master (`OPACUserCSS_V6.css`, `OPACUserJS_V6.js`, …), then regenerate the `.paste.` copy. Never hand-edit a paste copy. Koha inlines these prefs on every page, so keep them lean.
- **Version, don't overwrite.** Record what changed at the top of the master file. The previous release's copies move to `opac/legacy/`.
- **Record live changes.** Any change made in Koha's admin goes into the relevant project log, with the old value, so it can be rolled back.
- **No secrets.** Never commit passwords, API keys, patron data or exports with personal information.

## Commands

```bash
node opac/current/build.js                    # regenerate OPAC paste copies (needs terser)
node design-system/scripts/build.mjs          # regenerate design-system/tokens.css
node design-system/scripts/build.mjs --check  # fail if tokens.css is stale
python3 -m http.server 8000 --directory design-system   # component gallery at /gallery.html
```
