A labelled text input with optional hint and error. Provide the label text, the input's `id`, and hint or error text when needed.

## Anatomy
`.aj-form-field` > `.aj-label` + `.aj-field` (or `.aj-select`) + `.aj-hint` and/or `.aj-error`.

## States
- Rest: `border-control` (3:1). Hover: `text-muted` border. Focus: `focus-ring` border plus 3px outline.
- Invalid: `aria-invalid="true"`, a 2px `text-accent` border, and an `.aj-error` message below, joined with `aria-describedby`. The message rises in once. Colour is never the only signal: the icon and text carry it.
- Disabled: native `disabled`, `opacity-disabled`.
- Sizes: 46px default, `--lg` 52px on the login page.

## Content
Labels are nouns ("Card number"). Hints say where to find the value. Errors say what happened and what to do, without apology.

## Accessibility
Every field has a visible `<label for>`. Never use placeholder as the label. Errors are linked with `aria-describedby` and announced when shown.

## Tokens
`surface-card`, `text`, `text-muted`, `border-control`, `focus-ring`, `text-accent`, `size-control`, `size-control-lg`, `radius-md`, `space-2`, `space-4`, `duration-fast`.
