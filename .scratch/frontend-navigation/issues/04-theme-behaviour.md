Type: grilling
Status: resolved

## Question

How should the light/dark switch behave: default to light or follow the operating-system setting, where is the choice remembered (this browser only, or the user's account), and is there a third "system" option? Must apply on first paint without a flash of the wrong theme.

## Answer

- **Default:** follow the operating-system light/dark setting until the user picks explicitly; an explicit pick wins thereafter.
- **Storage:** the explicit pick is stored in this browser only (`localStorage`); no database or migration change.
- **Controls:** a quick light/dark toggle in the top bar (also on the sign-in screens), plus an Appearance setting on the Account page (System / Light / Dark) so "System" can be restored.
- **No flash on load:** a small inline script in `index.html` applies the theme before first render. (Proposed by the agent and confirmed with the user, not discussed in depth.)
- **Native UI:** the active theme also drives `theme-color` and `color-scheme` so form controls, scrollbars and the mobile address bar match.
