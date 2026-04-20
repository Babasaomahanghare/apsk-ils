
## Migrate APSK ILS to Lovable Cloud (permanent DB + realtime)

Move all data off `localStorage` into a real Postgres database with row-level security and realtime updates. Login UX stays the same (admission # for students, email for teachers, fixed admin credentials).

### 1. Enable Lovable Cloud
Provisions Postgres + Auth + Realtime + Edge Functions.

### 2. Database schema (migration)

- **`students`** — id (uuid pk), name, student_class, section, admission (unique), phone, email (unique), password_hash, created_at
- **`teachers`** — id, name, phone, email (unique), password_hash, created_at
- **`complaints`** — id, ticket_id (unique, e.g. `TKT-APS-2026-0001`), author_id, author_name, author_role (`student`|`teacher`), description, urgency, status, category, subtopic, response, deadline, created_at, updated_at
- **`feedback`** — id, author_id, author_name, text, rating, created_at
- **`notifications`** — id, user_id (text — supports `__admin__`), title, message, read, created_at
- **`ticket_counter`** — year (pk), seq — atomic ticket numbering via `next_ticket_id()` RPC

**Security**: Custom credential auth (per your choice). Passwords hashed with bcrypt via pgcrypto. RLS enabled with permissive policies — app trusts its own session, just like today. Admin gate stays the hardcoded `APSKADMINS` credentials client-side.

### 3. Data layer rewrite (`src/lib/store.ts` → `src/lib/db/*`)
Replace every localStorage call with Supabase queries. Session (`{userId, role, name}`) still cached in localStorage. Ticket IDs generated server-side (race-safe).

### 4. Realtime hooks
Supabase Realtime `postgres_changes` channels: live complaints list, live charts, slide-down notifications, live feedback panel.

### 5. Wire up existing pages (no UI redesign)
Auth pages, all 3 dashboards, TrackComplaint, PDF + Excel export — all consume new async data layer with loading skeletons.

### 6. Seed
Just `ticket_counter` for current year. No mock data — fresh start.

### What stays the same
All UI, dashboards, charts, animations, ticketing, SLA, PDF, Excel, design, login UX.

### What changes
True cross-device permanence, true multi-user realtime (admin sees a complaint the instant a student submits on another device), live charts.

### Risks
Custom-password DB auth is weaker than Supabase Auth even with bcrypt — you accepted the trade-off. All existing localStorage data is lost (you confirmed). First load slightly slower (mitigated with skeletons).
