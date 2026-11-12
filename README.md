# EXPERT CYBER SECURITY ZONE — CYBER SOHAG APP STORE

A professional catalogue / demo App Store for **CYBER SOHAG APP STORE**
(**EXPERT CYBER SECURITY ZONE • PUBLIC HELP CENTER**).
Telegram: [@cyberkingsohag](https://t.me/cyberkingsohag)

This is a catalogue website only. Apps are **not hosted in this repo** and
there are no direct downloads. To install an app, contact the admin on
Telegram — the Install button in the store opens
https://t.me/cyberkingsohag.

## Login, register and admin panel

The store opens with a **login page** first. It shows the ECSZ phoenix
logo large, "EXPERT CYBER SECURITY ZONE" and "CYBER SOHAG APP STORE",
with 3D inputs and buttons.

- **Register** — a new user creates an account with a name, a username
  and a password. A username that already exists cannot register again.
  After registering, the user logs in and can use the store.
- **Login** — username + password. A wrong login shows only a generic
  error ("ইউজারনেম বা পাসওয়ার্ড ভুল।"), never which field was wrong.
- **Passwords** — passwords are hashed with SHA-256 (Web Crypto API)
  before storing. No plaintext password is stored anywhere.
- **Admin panel** — the admin username is `sohag11`. When the admin
  logs in, a bottom-nav item **অ্যাডমিন** appears with an Admin Panel:
  total registered users, the list of users (name, username, registration
  date), total apps, total downloads and site visits. The admin can also
  see the whole store and add apps from the panel. Regular users do **not**
  see the admin panel. The admin password is set by the owner and is
  **not written in this README or in the code** — only its SHA-256 hash
  is stored in `app.js`.

## Dashboard

After login the dashboard shows, with the small ECSZ logo and brand in
the header, a profile button, and:

- **Stats row** — Top Trending app, Total Downloads, Total Apps, Site Visits
- **Search box** and **category pills** (All, Bot Hosting, Telegram Bots,
  AI, Tools)
- **Top Downloads** row, a **Featured** carousel with dots, a **For You**
  row, and the **All Apps** grid with big 3D app icons
- **App detail view** — icon, name, description, downloads, category,
  price and an Install button
- **Charts view** — top 10 apps by downloads
- **Profile view** — the logged-in user's name and username, and logout
- **Bottom nav** — Home, Charts, Search, Profile (+ Admin for the admin)

> অ্যাকাউন্ট, ডাউনলোড ও ভিজিট এই ডিভাইসে সংরক্ষিত হয় (localStorage) —
> সবার আসল মোট সংখ্যা দেখতে সার্ভার লাগবে। Accounts, downloads and
> visits are stored on this device only; a server would be needed for a
> global total across all visitors.

## Logo

The header shows the ECSZ phoenix logo (ring text: "EXPERT CYBER
SECURITY ZONE • PUBLIC HELP CENTER", centre: "ECSZ") — large on the
login page, small in the dashboard header, and again in the footer.

The logo is embedded as base64 JPEG inside `styles.css` (`.brand-logo`
and `.footer-logo`, resized to 256×256). No binary image file is in the
repo, because the GitHub snapshot push only accepts UTF-8 text files.
To change the logo, resize the new image to 256×256 JPEG and replace
the base64 data in `styles.css`.

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
No fake ratings or download counts are shown. Every app starts with
`"downloads": 0` in `apps.json`, and the counts grow from real clicks
on that device.

## How to view it

Open the site over `http://` / `https://` (for example GitHub Pages or a
local server such as `python3 -m http.server`), or publish the folder
with GitHub Pages:

1. Push this folder to a GitHub repository.
2. In the repository: **Settings → Pages → Deploy from a branch**,
   choose the branch and the folder containing `index.html`.
3. Open the GitHub Pages URL it gives you.

Note: `apps.json` is loaded with `fetch`, so opening `index.html`
directly with `file://` may block loading `apps.json` in some browsers,
and login (SHA-256 via Web Crypto) needs a secure context (`https://`
or `http://localhost`).

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

Categories used by the filter pills are: `Bot Hosting`,
`Telegram Bots`, `AI`, `Tools`. Use one of those so the app appears
under the right filter.

The "Add App" form in the admin panel only saves to that browser's
localStorage. To make an added app permanent, add it to `apps.json`
and push the change to GitHub.

## Files

- `index.html` — login/register page, dashboard (stats, search, pills,
  top downloads, featured carousel, grid, charts, profile, admin panel),
  app detail view and bottom nav.
- `styles.css` — dark cyber look with the 3D red/orange theme, responsive,
  system fonts only. Includes the base64 ECSZ phoenix logo (`.brand-logo`,
  `.footer-logo`) and the 3D buttons, cards and boxes.
- `app.js` — login/register with SHA-256 password hashes, admin panel,
  loads `apps.json`, renders the dashboard, search, filter, detail view,
  charts, profile and the stats (visit counter, per-app download counter
  stored in localStorage). No build step, no external JavaScript libraries.
- `apps.json` — the app catalogue (6 apps).
- `README.md` — this file.

## Safety

No Facebook cloning / cracking code, no NID verification bypass, and no
API keys, tokens or plaintext passwords are included anywhere in this
store. Only SHA-256 hashes of passwords are stored.
