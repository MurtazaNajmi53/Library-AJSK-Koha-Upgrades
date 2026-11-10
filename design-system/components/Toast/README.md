A brief confirmation after an action (the Koha basket message). Call `Aljamea.toast(text, {action, href})`.

## Behaviour
Bottom inline-end corner. Rises 12px and fades in (`duration-slow`, `ease-out`); stays 5 seconds; pauses while hovered or focused; leaves in `duration-fast`. Stacks with an 8px gap.

## Content
Past tense of the action that caused it: "Place hold" leads to "Hold placed". One optional action ("Undo", "View cart").

## Accessibility
Lives in a polite live region that exists before the first message. Never put the only copy of important information in a toast.

## Tokens
`surface-inverse`, `text-on-inverse`, `brand-gold` (action link), `shadow-raised`, `radius-md`, `z-toast`, `duration-slow`, `duration-fast`.
