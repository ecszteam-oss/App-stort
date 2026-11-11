# CYBER SOHAG APP STORE

A simple catalogue / demo App Store for **CYBER SOHAG BOT HOSTING**.
Telegram: [@cyberkingsohag](https://t.me/cyberkingsohag)

This is a catalogue website only. Apps are **not hosted in this repo** and
there are no direct downloads. To install an app, contact the admin on
Telegram — the Install button in the store opens
https://t.me/cyberkingsohag.

## Logo

The header shows the new ECSZ phoenix logo (ring text: "EXPERT CYBER
SECURITY ZONE • PUBLIC HELP CENTER", centre: "ECSZ") with the brand name
**CYBER SOHAG APP STORE** and the line "EXPERT CYBER SECURITY ZONE •
PUBLIC HELP CENTER" underneath. A small version of the same logo is in
the footer.

The logo is embedded as base64 JPEG inside `styles.css` (`.brand-logo`
and `.footer-logo`, resized to 256×256). No binary image file is in the
repo, because the GitHub snapshot push only accepts UTF-8 text files.
To change the logo, resize the new image to 256×256 JPEG and replace
the base64 data in `styles.css`.

## Stats dashboard

At the top of the store there is a stats bar with three live numbers:

- **Total Apps** — counted from `apps.json` (plus any apps added with
  the Add App form in this browser).
- **Total Downloads** — the sum of every app's download count. Clicking
  **Install** on an app adds 1 to that app's count and updates the card,
  the detail modal and the total straight away.
- **Site Visits** — how many times the store has been opened in this
  browser. It goes up by 1 on every page load.

How counting works: all three numbers are stored in the browser's
localStorage on that device only. Every app starts with
`"downloads": 0` in `apps.json`, and the counts grow from real clicks
and visits on that device.

> এই কাউন্টারটি এই ডিভাইসে সংরক্ষিত হয় — সবার মোট সংখ্যা দেখতে
> সার্ভার লাগবে। Counts are stored on this device only; a server
> would be needed for a global total across all visitors.

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
  "badge": "New",
  "downloads": 0
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
  Includes the base64 ECSZ phoenix logo (`.brand-logo`, `.footer-logo`),
  the 3D stats cards and the large 3D app icons.
- `app.js` — loads `apps.json`, renders the grid, search, filter, sort,
  detail modal and the local Add App form, and runs the stats dashboard
  (visit counter, per-app download counter stored in localStorage).
  No build step, no external JavaScript libraries.
- `apps.json` — the app catalogue.
- `README.md` — this file.

## Safety

No Facebook cloning / cracking code, no NID verification bypass, and no
API keys, tokens or passwords are included anywhere in this store.
