

## Plan: Photo attachments + 7-per-page pagination everywhere

### 1. Photo attachments on complaints

**Database (migration)**
- Create storage bucket `complaint-photos` (public read, authenticated write).
- Add `attachments text[]` column to `complaints` table (array of storage paths, default `'{}'`).
- RLS on `storage.objects` for `complaint-photos`: anyone can read, anyone can insert (matches current open-policy app model).

**Backend (`src/lib/store.ts`)**
- Extend `Complaint` type with `attachments: string[]`.
- Update `fetchComplaints` to map the new column.
- Update `createComplaint` to accept `files: File[]`, upload each to `complaint-photos/{ticketId}/{uuid}.{ext}` via `supabase.storage`, then save the resulting public URLs into `complaints.attachments`.
- Add helper `getPhotoPublicUrl(path)` for rendering.

**Teacher portal (`src/pages/dashboards/TeacherDashboard.tsx`)**
- Add a file input to the New Complaint form: "Attach photos (optional, max 4, 5MB each, JPG/PNG/WEBP)".
- Client-side validation: count, size, mime type.
- Show inline thumbnail previews before submit.

**Complaint card (used in Admin + Teacher dashboards)**
- Render attached photos as a thumbnail row below the description. Click → open full-size in a `Dialog` lightbox.
- Show "📎 N" badge on the card header when attachments exist.

**SLA PDF report (`src/lib/slaReport.ts`)**
- Add an "Attachments" column (count only, e.g. "2 photos") — keeps the table compact. No image embedding in PDF (would balloon file size).

### 2. Pagination — 7 items per page across the app

Create a single shared hook `src/hooks/usePagination.ts`:
```ts
usePagination<T>(items: T[], pageSize = 7)
  → { page, setPage, totalPages, pageItems, reset }
```

Apply to every list view. The existing `Pagination` component (`src/components/dashboard/Pagination.tsx`) is already in use — reuse it everywhere with `pageSize=7`:

| Location | List being paginated |
|---|---|
| `AdminDashboard.tsx` | Complaints list (currently shows top 6 — change to 7) |
| `AdminDashboard.tsx` | Activity Logs panel |
| `AdminDashboard.tsx` | Approved Teachers panel |
| `AdminDashboard.tsx` | Feedback list |
| `AdminDashboard.tsx` | Users (teachers) list |
| `TeacherDashboard.tsx` | "My complaints" list |
| `TeacherDashboard.tsx` | Notifications list |
| `TrackComplaint.tsx` | Comment thread (if >7) |

Pagination resets to page 1 whenever filters/search change. Page controls hidden when `totalPages <= 1`.

### Technical details

- **Storage path**: `complaint-photos/{ticket_id}/{random-uuid}.{ext}` — keeps assets grouped per complaint and easy to clean up later.
- **Upload flow**: create complaint row → get `ticket_id` back → upload files → `update` row with `attachments` array. Wrapped so a failed upload doesn't block complaint creation (complaint saves, photos retried/skipped with a toast).
- **Realtime**: existing `useComplaints` already subscribes to `postgres_changes`; the new `attachments` column flows through automatically.
- **No UI redesign**: thumbnails reuse existing `Card` / `Dialog` / `Badge` components and current spacing.
- **Pagination UX**: identical look to existing `Pagination` component (Prev / 1 2 3 / Next), placed at the bottom of each list section.

### Files

**Created**
- `supabase/migrations/<ts>_complaint_attachments.sql`
- `src/hooks/usePagination.ts`
- `src/components/dashboard/PhotoLightbox.tsx`

**Updated**
- `src/lib/store.ts` (type + create/fetch logic + upload helper)
- `src/lib/slaReport.ts` (attachments count column)
- `src/pages/dashboards/TeacherDashboard.tsx` (file input, previews, my-complaints pagination, notifications pagination)
- `src/pages/dashboards/AdminDashboard.tsx` (7-per-page on all lists, photo thumbnails on cards)
- `src/components/dashboard/ApprovedTeachersPanel.tsx` (pagination)
- `src/pages/TrackComplaint.tsx` (show attachments + paginate comments)

