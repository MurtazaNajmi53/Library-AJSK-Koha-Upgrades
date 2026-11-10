The email template for official conference mail and for the notices Koha sends (holds, overdues, renewals). The files are under `assets/Email`.

## Anatomy
- **Card:** 600px wide on a sand page, one 1px `border-subtle` border and no top rule (like every card), `radius-md` corners where the mail app supports them.
- **Header band:** the Aljamea logo (PNG, blue in light mode, cream in dark mode) and the kind of message in muted DM Sans: "Conference" or "Library notice".
- **Title:** a short eyebrow (`action` colour) and the heading in DM Sans 700 with slight negative tracking (none in Arabic).
- **Body:** paragraphs, a details table (label and value rows), an optional notice box for something the reader must act on, and one pill button.
- **Footer band:** مكتبة الجامعة and *The Library of Aljamea-tus-Saifiyah*, as on the JDC cover, then the library's address and email, and one line saying why the reader received the message (with Unsubscribe for conference mail).

## Files
- `aljamea-email-template.html`: the master, with `{{PLACEHOLDERS}}`.
- `example-conference-invitation.html` and `example-conference-invitation-ar.html`: a filled conference invitation in English and in Arabic (right to left).
- `example-koha-hold-notice.html`: a Koha HOLD notice using Template Toolkit (`[% borrower.firstname %]`, `[% biblio.title %]`, `[% hold.expirationdate | $KohaDates %]`).
- Logos: `aljamea-logo-blue.png` and `aljamea-logo-cream.png` in the Email asset group, 244 by 104 pixels (shown at 122 by 52).

## Setting it up
1. Put both logo PNGs on a public web server (for example the Koha server's `opac-tmpl` folder) and replace `{{ASSET_BASE}}` with that address. Mail apps cannot load images from this design system.
2. Replace `{{LIBRARY_EMAIL}}`. For conference mail, also set a real unsubscribe link.
3. **Koha:** Tools > Notices and slips, edit the notice, tick *HTML message*, and paste the template. Koha wraps HTML notices in its own page, so if the result looks doubled, paste only what is between `<body>` and `</body>` and keep the `<style>` block at its top. Check the variable names against your Koha version: each notice offers its own set, and the example's `hold.expirationdate` in particular may differ. Koha lists the available fields beside the notice editor. Send yourself a test notice before switching it on for readers.

## How it holds up in mail apps
- Layout is nested tables with inline styles, so Gmail, Outlook and Apple Mail render it the same. Outlook on Windows gets a VML button with rounded ends.
- Fonts: Apple Mail and iOS load DM Sans and Tajawal. Everywhere else falls back to Segoe UI, Helvetica or Arial, and Tahoma for Arabic. The email has no serif, so the fallback keeps the same character.
- The button sits in a row of its own, lined up with the text, with fixed space above and below set by cell padding (Outlook ignores margins).
- Dark mode: Apple Mail, iOS and Outlook switch to the night palette and the cream logo. Gmail applies its own dark colours; the template stays readable because no text sits on an image.
- Phones: below 620px the card goes full width and padding drops to 24px.
- A hidden preheader sets the line shown under the subject in the inbox.

## Content
Subject and heading say what happened or what to do ("Your book is ready to collect"). One button, named for its outcome ("Confirm my place", "View my account"). System notices say they are automatic and where to write instead. No exclamation marks.

## Tokens (copied as hex, because email cannot read CSS variables)
`surface-band` page, `surface-card`, `surface-page` header and footer bands, `ornament` rules, `text`, `text-muted`, `text-heading`, `action` and `on-action` (button), `text-accent` (notice title), `border-subtle`, `border-strong`; dark values from the dark theme.
