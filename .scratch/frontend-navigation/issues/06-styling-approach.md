Type: grilling
Status: resolved

## Question

How is variant B implemented: keep plain CSS and introduce CSS custom properties as design tokens (colour, type scale, spacing) with a light/dark theme layer, or adopt a styling library? Include how the existing `styles.css` is replaced or migrated, and which tokens the prototype on `prototype/visual-direction` already defines.

## Answer

- **Approach:** plain CSS with custom properties as design tokens. No styling library and no component library.
- **Theming:** light and dark are two value sets switched by the `data-theme` attribute set by the theme behaviour decision's inline script.
- **Structure:** `tokens.css` (colour, type, spacing variables and both themes), `base.css` (reset, typography, shared controls, tables, calendar grid), `shell.css` (top bar, full-screen phone menu, desktop tabs, page layout), plus one small CSS file per page imported by that page's component. `styles.css` is deleted once the last page has moved over; class names are free to change.
- **Tokens:** start from the prototype's palette (`--bg`, `--surface`, `--ink`, `--mute`, `--line`, `--accent`, `--on`, `--c1`–`--c3`, light and dark sets; see branch `prototype/visual-direction`) with a system font stack and no web fonts.
- **Contrast:** WCAG AA for text and controls in both themes is an acceptance requirement, checked before sign-off; failing values are adjusted in the build.
