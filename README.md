# CYBER SOHAG APP STORE

A simple catalogue / demo App Store for **CYBER SOHAG BOT HOSTING**.
Telegram: [@cyberkingsohag](https://t.me/cyberkingsohag)

This is a catalogue website only. Apps are **not hosted in this repo** and
there are no direct downloads. To install an app, contact the admin on
Telegram — the Install button in the store opens
https://t.me/cyberkingsohag.

## What is in the store?

- **CYBER SOHAG BOT HOSTING** — host up to 30 bots, admin unlimited,
  new accounts start after admin approval.
- **Telegram Live Support Bot** — general live chat bot; customer messages
  reach the admin, who replies live. `/online`, `/offline` and voice replies.
- **CYBER SOHAG AI BOT** — AI chatbot for customers, Groq AI chat and
  ElevenLabs voice support.
- **Telegram Auto-Reply Bot** — offline auto-replies for customers.
  Currently paused by the user.
- **Bot Hosting Dashboard (Mobile Demo)** — live dashboard demo.
- **API Tools** — coming soon.

No prices are invented — every app says "Contact on Telegram".
No fake ratings or download counts are shown.

## How to view it

Open `index.html` in a browser, or publish the folder with GitHub Pages:

1. Push this folder to a GitHub repository.
2. In the repository: **Settings → Pages → Deploy from a branch**,
   choose the branch and the folder containing `index.html`.
3. Open the GitHub Pages URL it gives you.

Note: `apps.json` is loaded with `fetch`, so open the site over
`http://` / `https://` (for example GitHub Pages or a local server such as
`python3 -m http.server`). Opening `index.html` directly with `file://`
may block loading `apps.json` in some browsers.

## How to add a new app

Edit `apps.json` and add one entry to the list. Example:

```json
{
  "id": "my-new-app",
  "name": "My New App",
  "category": "Tools",
  "icon": "📦",
  "description": "অ্যাপটা কী করে, বাংলায় লিখুন।",
  "description_en": "What the app does, in English.",
  "price": "Contact on Telegram",
  "status": "Available",
  "badge": "New"
}
```

Categories used by the filter chips are: `Bot Hosting`,
`Telegram Bots`, `AI`, `Tools`. Use one of those so the app appears
under the right filter.

The "Add App" form in the store itself only saves to that browser's
localStorage. To make an added app permanent, add it to `apps.json`
and push the change to GitHub.

## Files

- `index.html` — the store page (header, search, filters, hero, grid,
  detail modal, Add App form, footer).
- `styles.css` — 3D red/orange styling, responsive, system fonts only.
- `app.js` — loads `apps.json`, renders the grid, search, filter, sort,
  detail modal and the local Add App form. No build step, no external
  JavaScript libraries.
- `apps.json` — the app catalogue.
- `README.md` — this file.

## Safety

No Facebook cloning / cracking code, no NID verification bypass, and no
API keys, tokens or passwords are included anywhere in this store.
