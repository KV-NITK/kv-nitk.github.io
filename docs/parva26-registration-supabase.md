# Parva 26 literacy-event registrations: Supabase setup

Forms: `/parva-26/regform` (chooser) → `/quiz`, `/proverbsandriddles`, `/filmsongchallenge`.
The browser inserts straight into Supabase with the public **anon key**; row-level security makes the tables insert-only.

## 1. Create the project
1. Go to https://supabase.com → sign in (GitHub login is fine) → **New project**.
2. Pick an organisation, name it (e.g. `kv-parva26`), set a strong **database password** (save it somewhere; you rarely need it), choose the region closest to India (**Mumbai / ap-south-1**), Free plan → **Create new project**. Wait ~2 minutes.
   - If KV already has a Supabase project (the server uses one), you can reuse it: the new tables are all prefixed `literacy_`.

## 2. Create the tables
1. Left sidebar → **SQL Editor** → **New query**.
2. Paste the whole of `server/sql/006_parva26_literacy_registrations.sql` → **Run**. Expect "Success. No rows returned". It is safe to re-run.
3. Check: sidebar → **Table Editor**. You should see
   `literacy_quiz_registrations`, `literacy_proverbs_riddles_registrations`, `literacy_film_song_registrations`.

What the script does:
- One table per event, columns named exactly like the form fields (`group_name`, `leader_name`, `leader_roll_no`, `leader_email`, `leader_phone`, `member2_name` …). Quiz `member4_name` is nullable (optional); Film-song's is required; Proverbs has only member 2.
- `CHECK` constraints (lengths, email shape, 10-digit phone) so bad data is rejected even if someone bypasses the form.
- Unique indexes per event: same group name, same leader roll no, or same leader email cannot register twice (case-insensitive).
- Row Level Security: the public (`anon`) role can only INSERT. It cannot read, edit or delete, so nobody can scrape students' phone numbers/emails.

## 3. Get your URL and anon key
Sidebar → **Project Settings** (gear) → **API** (or **API Keys**):
- **Project URL**: `https://xxxx.supabase.co`
- **anon / public** key (the long `eyJ…` string, or `sb_publishable_…` on newer projects).
Do NOT use the `service_role` / secret key in the frontend. Ever.

## 4. Configure the React app
1. Copy `.env.example` to `.env` (git-ignored) and set
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
2. `npm install` (adds `@supabase/supabase-js`), then `npm run dev`.
3. For the deployed site, the same two variables must exist at **build time** (Vite inlines them). Look at `.github/workflows/ci-cd.yml`: add them as GitHub repo **Settings → Secrets and variables → Actions → New repository secret** named `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (the workflow already reads them).

## 5. Test
1. Open `/parva-26/regform/quiz`, submit a fake team → "You're registered".
2. Supabase → **Table Editor** → `literacy_quiz_registrations`: the row is there.
3. Submit again with the same group name → you get "This group name is already registered".
4. Optional RLS check: in the SQL editor run `set role anon; select * from literacy_quiz_registrations;` → permission denied. Then `reset role;`.
   (Test rows: delete them in the Table Editor before the fest.)

## 6. Reading the data as organiser
- **Table Editor**: view/sort/filter; top-right **⋯ → Export to CSV**.
- Or SQL Editor: `select * from literacy_quiz_registrations order by created_at;`
- Only people with access to your Supabase project can see the data.

## Good to know
- Free plan pauses projects after 7 days of *no* activity; open the dashboard now and then, and before the fest.
- Bots: the form has a hidden honeypot field. If spam appears, add Cloudflare Turnstile or close registrations by revoking the INSERT grant:
  `revoke insert on literacy_quiz_registrations from anon, authenticated;`
- Changing a field later: `alter table ... add column ...`, then add it to `src/components/Parva26/regform/events.js`.
