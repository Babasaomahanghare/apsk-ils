

## Add email notifications for complaint events

Send automated emails to students (and teachers) when complaint-related events happen. This uses Lovable's built-in email infrastructure — no third-party API keys needed.

### What gets sent and when

1. **Complaint submitted** → email to the student/teacher who submitted it
   - "We've received your complaint" + summary + urgency + a tracking ID
2. **Complaint status updated by admin** (resolved / rejected / pending) → email to the original author
   - New status + admin response message (if any)

### Prerequisites (one-time setup)

1. **Enable Lovable Cloud** — required for any email sending. Currently the app uses `localStorage` only; we need Cloud for the email backend. The user data and complaints can stay in `localStorage` for now (no migration required), but we need Cloud just to host the email Edge Function.
2. **Set up an email sender domain** — you'll need a domain you own (e.g. `apskhadki.edu.in`). A subdomain like `notify.yourdomain.com` gets delegated to Lovable's nameservers via NS records you add at your domain registrar. This takes ~5 minutes plus DNS propagation time.
3. **Scaffold the email infrastructure** — sets up the email queue, suppression handling, and the `send-transactional-email` Edge Function.

### Implementation steps

1. Enable Lovable Cloud
2. Run email domain setup (you provide the domain → add NS records at registrar)
3. Scaffold transactional email infrastructure
4. Create two React Email templates:
   - `complaint-received.tsx` — confirmation with description preview, urgency badge, complaint ID
   - `complaint-status-update.tsx` — new status, admin response, color-coded
5. Wire triggers in `src/lib/store.ts`:
   - `addComplaint()` → invoke `send-transactional-email` with `complaint-received` template, recipient = author's email
   - `updateComplaintStatus()` → invoke `send-transactional-email` with `complaint-status-update` template, recipient = looked up via `getUsers().find(u => u.id === complaint.authorId).email`
6. Both calls use an `idempotencyKey` derived from the complaint ID + event type so retries are safe
7. Build the email templates to match the APSK brand (navy / skyblue / gold, Poppins-style fallback) on a white background

### What you need from the user before we start

- Confirm you want to enable Lovable Cloud (required)
- The domain you want emails to come from (e.g. `notify@apskhadki.edu.in`)
- Access to your domain registrar's DNS settings to add NS records

### Notes / limitations

- File attachments aren't supported — emails will be HTML only (the complaint description is included in the body)
- Emails can only be sent to addresses students/teachers entered at registration — make sure email validation is solid (it already is)
- Admins won't get emails for new complaints (they already get the in-app notification + popup) — easy to add later if desired
- Cross-tab `localStorage` sync stays as-is; emails are an additive layer

