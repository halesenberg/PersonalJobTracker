# Job Tracker (case study)

Prototype of a personal job application tracker.
Designed in Figma (design system with variables, components and 3 screens), then built in code with Claude Code.

Flow: welcome cover (swipe up, tap or press Enter) opens the list; each card opens its own detail; status can be chosen when adding an application and changed later in the detail. Data stays in the browser (localStorage).

- `tokens.css`: design tokens exported from the Figma variables
- `styles.css`: layout and components, using only the tokens
- `app.js`: screens, navigation and saving (data stays in the browser)
- `index.html`: entry point
