# Job Tracker (case study)

Prototype of a personal job application tracker.
Designed in Figma (design system with variables, components and 3 screens), then built in code with Claude Code.

Flow: welcome cover (swipe up, tap or press Enter) opens the list; each card opens its own detail; status can be chosen when adding an application and changed later in the detail. Data stays in the browser (localStorage).

- `tokens.css`: design tokens exported from the Figma variables
- `styles.css`: layout and components, using only the tokens
- `app.js`: screens, navigation and saving (data stays in the browser)
- `index.html`: entry point

## Publish on GitHub Pages
1. Create a new repository (for example `job-tracker`) and upload these files to its root.
2. Open Settings, then Pages.
3. Under Build and deployment choose "Deploy from a branch", branch `main`, folder `/ (root)`.
4. After a minute the site is live at `https://<username>.github.io/job-tracker/`.
