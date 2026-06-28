# FutureLetter

Write a letter to your future self. Two pages: a landing page, and the page where you write.

## What it does

- **Landing page** (`/`) — one headline, one button.
- **Write page** (`/write`) — email, letter, optional "read again on" date, one submit button.
- Every submission is saved to **Supabase** (Postgres). That's the single source of truth.
- An **Excel export** is generated on demand straight from Supabase at `/api/export-letters?key=YOUR_EXPORT_SECRET` — there's no separate Excel file to keep in sync, it always reflects exactly what's in the database.

## 1. Create the Supabase table

In your Supabase project, open the SQL editor and run:

```sql
create table letters (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  letter text not null,
  deliver_on date,
  created_at timestamptz not null default now()
);

alter table letters enable row level security;
-- No policies are added on purpose: with RLS on and zero policies,
-- the table is unreachable from the public anon key. Only the server,
-- using the service role key, can read or write it. That's what keeps
-- letters private.
```

## 2. Set environment variables

Copy `.env.local.example` to `.env.local` and fill in:

- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — from Project Settings → API in your Supabase dashboard. **Use the service role key, not the anon key** — it's what lets the API route write past RLS. Never expose this key in client-side code.
- `EXPORT_SECRET` — any long random string you make up. It's the password for downloading the Excel export.

## 3. Install and run

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

## Getting your data as Excel

Visit `http://localhost:3000/api/export-letters?key=YOUR_EXPORT_SECRET` (swap in whatever you set `EXPORT_SECRET` to) and it downloads `futureletter-export.xlsx` with every letter — email, letter text, read-again date, and written-on timestamp. There's no button for this in the UI on purpose, since it returns everyone's private letters — keep the link and the secret to yourself.

## Notes on scope

- There's no login system — anyone can write a letter with any email. If you want people to only see their own letters back, that needs accounts, which isn't built here.
- The "read again on" date is saved with the letter but doesn't trigger an actual email yet. Sending a real email on that date would need a scheduled job (e.g. a daily cron) plus an email service (e.g. Resend) — straightforward to add later, just not in this simple version.
- No pricing or marketing pages, as requested — just the two pages above.

## Project structure

```
app/
  page.js                       Landing page
  write/page.js                 Write Letter page
  api/submit-letter/route.js    Saves a letter to Supabase
  api/export-letters/route.js   Builds the Excel file from Supabase, on demand
  layout.js, globals.css
lib/
  supabaseAdmin.js               Server-only Supabase client (service role key)
tailwind.config.js, postcss.config.js, jsconfig.json
.env.local.example
```
# futureletter
