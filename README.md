# ZenFund (Next.js rebuild)

Same app as the original single-file prototype same HTML/CSS, same
Bootstrap modals and transitions, same OCR/Excel/chart/calendar features
split into a proper Next.js project, with transactions and the budget
config stored in Postgres instead of localStorage, and a passcode gate
in front of it.

## How it's structured
- `app/layout.js` loads Bootstrap CSS / Font Awesome, wraps every page
- `app/globals.css` the original theme CSS, unchanged, plus calendar
  styling the original never actually defined (see note below)
- `app/page.js` renders the app markup, then loads Bootstrap JS,
  Chart.js, SheetJS, and Tesseract.js in order, then `app-logic.js`
- `lib/markup.js` the body HTML, copied as-is from your prototype
- `public/app-logic.js` the original script, with `localStorage` calls
  swapped for `fetch()` calls to the API routes below
- `app/api/transactions/route.js` + `[id]/route.js` list/create/delete
  transactions
- `app/api/budget/route.js` read/update the budget cap
- `lib/db.js` Postgres queries (creates its own tables on first use)
- `middleware.js` + `app/login/page.js` + `app/api/auth/route.js` the
  passcode gate

## What was actually wrong in the earlier stacked attempt
- Transitions looked "default": Bootstrap's modal fade/backdrop animation
  comes from `bootstrap.bundle.min.js` actually running and from the
  original CSS classes being present untouched. This version keeps the
  exact markup and CSS and drives modals the same imperative way
  (`new bootstrap.Modal(...)`) instead of trying to reimplement it in
  React state.
- Colors looked "grayer": likely Bootstrap's own default `--bs-primary`
  bleeding through because the custom `:root` variables got reordered or
  dropped. Here `globals.css` is loaded after Bootstrap's CSS in
  `layout.js`, so the custom `--primary` / `--primary-dark` always win.
- "Rencana Simulasi Target" not working: the original file's calendar
  (`.calendar-wrapper`, `.cal-grid`, `.cal-day`, `.ai-bubble`, ...) was
  referenced by the script but **never had CSS rules in the original
  file** so it was rendering unstyled at best. I added real styles for
  it in `globals.css`.

## Local setup
```bash
npm install
cp .env.example .env.local
# set ZENFUND_PASSCODE in .env.local
npm run dev
```
Without a `POSTGRES_URL`, the API routes will error — either attach a
Vercel Postgres DB and pull the env vars (see below), or point
`POSTGRES_URL` at any Postgres instance for local testing.

## Deploying on Vercel
1. Push this folder to your GitHub repo.
2. In Vercel: **New Project** → import that repo.
3. **Storage** tab → **Create Database** → Postgres → attach it to the
   project. Vercel injects `POSTGRES_URL` (and friends) automatically.
4. **Settings → Environment Variables** → add `ZENFUND_PASSCODE` with
   whatever passcode you want to log in with.
5. Deploy. First request creates the two tables automatically
   (`lib/db.js` runs `CREATE TABLE IF NOT EXISTS` on first query).
6. Open the deployed URL, enter the passcode, and it behaves exactly like
   the original file — except your data now lives in Postgres and is the
   same on every device you log into.

## Known prototype-level shortcuts (carried over on purpose)
- Receipt photos are stored as base64 data URLs in the `foto` column 
  fine for a personal app, but will bloat the DB fast with many receipts.
  If that becomes a problem, swap to Vercel Blob storage for photos.
- The passcode cookie is a single shared secret, not per-user accounts 
  matches what you asked for (no login system, single-user).
- OCR (Tesseract) and Excel import/export still run entirely in the
  browser, same as the original — no backend involved there.
