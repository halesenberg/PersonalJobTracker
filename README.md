# Personal Job Tracker

A personal app to record and organise job applications. Designed in Figma (design system with variables, components and four screens), then built in code with Claude Code.

Live app: https://halesenberg.github.io/PersonalJobTracker/

## How it works

The app starts empty on purpose. It is a tool for recording and organising your own applications, so it holds only what you add yourself.

1. **Welcome.** The first screen is always a teal cover with a greeting and a one line summary (for example "2 active applications, 1 interview", or "No applications yet"). Swipe up, tap it, or press Enter to continue.
2. **First launch.** The very first time, the swipe leads straight to the New application screen, so the first thing you do is add an application. From the second launch the swipe leads to the list.
3. **Applications.** A list of cards, each with job title, company, a short line about its stage and a colour coded status chip (Applied, Interview, Offer, Rejected). Tap a card to open it. The Add application button opens the form.
4. **New application.** Job title and company are required, status defaults to Applied, and the link to the posting is optional (it must start with http or https). Save adds the card at the top of the list, Cancel goes back.
5. **Detail.** Company and date are read only. Status can be changed at any time and the chip updates in the list. Notes are saved as you type. Back to list returns to the list.

## Data

Everything is saved in the browser (localStorage). Nothing is sent anywhere, there is no account yet, and data is not shared between devices or browsers. A backend would be the natural next step.

To start again from zero, delete the `job-tracker-v2` and `job-tracker-started` entries from the browser's local storage.

## Accessibility

Labelled form fields, full keyboard use, visible focus, error messages announced to screen readers, a tap or Enter alternative to the swipe gesture, and support for reduced motion.

## Files

- `tokens.css`: design tokens exported from the Figma variables
- `styles.css`: layout and components, using only the tokens
- `app.js`: screens, navigation and saving
- `index.html`: entry point
