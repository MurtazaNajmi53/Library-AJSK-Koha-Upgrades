Email templates and the PNG logos they use. Mail apps can't show SVG or load images from this system: upload `aljamea-logo-blue.png` (light mode) and `aljamea-logo-cream.png` (dark mode) to your own web server and point `{{ASSET_BASE}}` at them. See the EmailTemplate card for setup, including Koha notices.

- `aljamea-email-template.html`: master template with placeholders.
- `example-conference-invitation.html`, `example-conference-invitation-ar.html`: conference invitation, English and Arabic.
- `example-koha-hold-notice.html`: Koha HOLD notice with Template Toolkit variables.
- `aljamea-logo-blue.png` (ink `logo` light, #233787) and `aljamea-logo-cream.png` (ink #F3EDE0): 244 by 104 pixels, shown at 122 by 52.
- `gmail-kit.html`: for the shared library address when sending from Gmail by hand. It holds the everyday signature and one formal template, both built to survive copy and paste (inline styles only, Georgia and Arial, no dark-mode CSS), with Copy buttons and setup steps. In Gmail, the logo is uploaded as an inline image rather than hosted.
