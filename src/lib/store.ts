// Supabase-backed data layer. The session ({userId, role, name}) is still cached
// in localStorage so refreshes keep the user logged in. All other data is in Postgres.

import { supabase } from "@/integrations/supabase/client";

export type Role = "student" | "teacher" | "admin";
export type Urgency = "low" | "medium" | "high";
export type Status = "pending" | "resolved" | "rejected";

export interface StudentUser {
  id: string;
  role: "student";
  name: string;
  studentClass: string;
  section: string;
  admission: string;
  phone: string;
  email: string;
  createdAt: number;
}
export interface TeacherUser {
  id: string;
  role: "teacher";
  name: string;
  phone: string;
  email: string;
  createdAt: number;
}
export type AppUser = StudentUser | TeacherUser;

export interface Complaint {
  id: string;
  ticketId: string;        // TKT-APS-YYYY-NNNN
  authorId: string;
  authorName: string;
  authorRole: "student" | "teacher";
  description: string;
  urgency: Urgency;
  status: Status;
  category?: string;
  subtopic?: string;
  response?: string;
  deadline: number;        // SLA timestamp
  createdAt: number;
  updatedAt: number;
}

export interface Feedback {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  rating: number;
  createdAt: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: number;
}

export interface Comment {
  id: string;
  complaintId: string;
  authorId: string;
  authorName: string;
  authorRole: "student" | "teacher" | "admin";
  message: string;
  createdAt: number;
}

export interface Session {
  userId: string;
  role: Role;
  name: string;
}

const SESSION_KEY = "apsk.session";

export const TEACHER_CATEGORIES = {
  "School Infrastructure": ["Bench", "Projector", "Interactive Panel", "Windows", "Fan"],
  "Missing Components": [
    "Benches less",
    "No projector",
    "No interactive panel",
    "No window",
    "No table",
    "No chair",
    "No fan",
  ],
} as const;

export const ADMIN_USERNAME = "APSKADMINS";
export const ADMIN_PASSWORD = "APSKADMINS19065";
export const ADMIN_USER_ID = "__admin__";

// ---------- SLA ----------
const SLA_HOURS: Record<Urgency, number> = {
  low: 5 * 24,    // 5 days
  medium: 3 * 24, // 3 days
  high: 24,       // 24 hours
};

export const slaDeadlineFrom = (createdAt: number, urgency: Urgency): number =>
  createdAt + SLA_HOURS[urgency] * 3600 * 1000;

export type SlaState = "ontime" | "near" | "overdue" | "done";

export const slaState = (c: Complaint, now = Date.now()): SlaState => {
  if (c.status === "resolved" || c.status === "rejected") return "done";
  const remaining = c.deadline - now;
  if (remaining <= 0) return "overdue";
  const totalMs = SLA_HOURS[c.urgency] * 3600 * 1000;
  if (remaining <= totalMs * 0.25) return "near";
  return "ontime";
};

// ---------- row mappers ----------
type ComplaintRow = {
  id: string; ticket_id: string; author_id: string; author_name: string;
  author_role: "student" | "teacher"; description: string; urgency: Urgency;
  status: Status; category: string | null; subtopic: string | null;
  response: string | null; deadline: string; created_at: string; updated_at: string;
};
type StudentRow = {
  id: string; name: string; student_class: string; section: string;
  admission: string; phone: string; email: string; created_at: string;
};
type TeacherRow = {
  id: string; name: string; phone: string; email: string; created_at: string;
};
type FeedbackRow = {
  id: string; author_id: string; author_name: string; text: string;
  rating: number; created_at: string;
};
type NotificationRow = {
  id: string; user_id: string; title: string; message: string;
  read: boolean; created_at: string;
};
type CommentRow = {
  id: string; complaint_id: string; author_id: string; author_name: string;
  author_role: "student" | "teacher" | "admin"; message: string; created_at: string;
};

export const mapComplaint = (r: ComplaintRow): Complaint => ({
  id: r.id,
  ticketId: r.ticket_id,
  authorId: r.author_id,
  authorName: r.author_name,
  authorRole: r.author_role,
  description: r.description,
  urgency: r.urgency,
  status: r.status,
  category: r.category ?? undefined,
  subtopic: r.subtopic ?? undefined,
  response: r.response ?? undefined,
  deadline: new Date(r.deadline).getTime(),
  createdAt: new Date(r.created_at).getTime(),
  updatedAt: new Date(r.updated_at).getTime(),
});
export const mapStudent = (r: StudentRow): StudentUser => ({
  id: r.id, role: "student", name: r.name, studentClass: r.student_class,
  section: r.section, admission: r.admission, phone: r.phone, email: r.email,
  createdAt: new Date(r.created_at).getTime(),
});
export const mapTeacher = (r: TeacherRow): TeacherUser => ({
  id: r.id, role: "teacher", name: r.name, phone: r.phone, email: r.email,
  createdAt: new Date(r.created_at).getTime(),
});
export const mapFeedback = (r: FeedbackRow): Feedback => ({
  id: r.id, authorId: r.author_id, authorName: r.author_name,
  text: r.text, rating: r.rating, createdAt: new Date(r.created_at).getTime(),
});
export const mapNotification = (r: NotificationRow): Notification => ({
  id: r.id, userId: r.user_id, title: r.title, message: r.message,
  read: r.read, createdAt: new Date(r.created_at).getTime(),
});
export const mapComment = (r: CommentRow): Comment => ({
  id: r.id, complaintId: r.complaint_id, authorId: r.author_id,
  authorName: r.author_name, authorRole: r.author_role,
  message: r.message, createdAt: new Date(r.created_at).getTime(),
});

// ---------- session (cached locally) ----------
export const getSession = (): Session | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch { return null; }
};
export const setSession = (s: Session | null) => {
  if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  else localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new CustomEvent("apsk:session"));
};
export const logout = () => setSession(null);

// ---------- fetchers ----------
export const fetchComplaints = async (): Promise<Complaint[]> => {
  const { data, error } = await supabase
    .from("complaints").select("*").order("created_at", { ascending: false });
  if (error) { console.error(error); return []; }
  return (data as ComplaintRow[]).map(mapComplaint);
};
export const fetchStudents = async (): Promise<StudentUser[]> => {
  const { data, error } = await supabase.from("students").select("*");
  if (error) { console.error(error); return []; }
  return (data as StudentRow[]).map(mapStudent);
};
export const fetchTeachers = async (): Promise<TeacherUser[]> => {
  const { data, error } = await supabase.from("teachers").select("*");
  if (error) { console.error(error); return []; }
  return (data as TeacherRow[]).map(mapTeacher);
};
export const fetchUsers = async (): Promise<AppUser[]> => {
  const [s, t] = await Promise.all([fetchStudents(), fetchTeachers()]);
  return [...s, ...t];
};
export const fetchFeedback = async (): Promise<Feedback[]> => {
  const { data, error } = await supabase
    .from("feedback").select("*").order("created_at", { ascending: false });
  if (error) { console.error(error); return []; }
  return (data as FeedbackRow[]).map(mapFeedback);
};
export const fetchNotifications = async (): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from("notifications").select("*").order("created_at", { ascending: false });
  if (error) { console.error(error); return []; }
  return (data as NotificationRow[]).map(mapNotification);
};

export const findComplaintByTicket = async (ticketId: string): Promise<Complaint | undefined> => {
  const { data, error } = await supabase
    .from("complaints").select("*")
    .ilike("ticket_id", ticketId.trim()).maybeSingle();
  if (error || !data) return undefined;
  return mapComplaint(data as ComplaintRow);
};

// ---------- auth ----------
export const registerStudent = async (
  data: Omit<StudentUser, "id" | "role" | "createdAt"> & { password: string },
): Promise<{ ok: boolean; error?: string; user?: StudentUser }> => {
  // Check uniqueness
  const { data: dupAdm } = await supabase.from("students").select("id")
    .eq("admission", data.admission).maybeSingle();
  if (dupAdm) return { ok: false, error: "Admission number already registered." };
  const { data: dupEmail } = await supabase.from("students").select("id")
    .ilike("email", data.email).maybeSingle();
  if (dupEmail) return { ok: false, error: "Email already registered." };

  const { data: hashData, error: hashErr } = await supabase.rpc("hash_password", { _password: data.password });
  if (hashErr || !hashData) return { ok: false, error: hashErr?.message ?? "Password hash failed" };

  const { data: inserted, error } = await supabase.from("students").insert({
    name: data.name, student_class: data.studentClass, section: data.section,
    admission: data.admission, phone: data.phone, email: data.email,
    password_hash: hashData as unknown as string,
  }).select("*").single();
  if (error || !inserted) return { ok: false, error: error?.message ?? "Registration failed" };
  return { ok: true, user: mapStudent(inserted as StudentRow) };
};

export const registerTeacher = async (
  data: Omit<TeacherUser, "id" | "role" | "createdAt"> & { password: string },
): Promise<{ ok: boolean; error?: string; user?: TeacherUser }> => {
  const { data: dupEmail } = await supabase.from("teachers").select("id")
    .ilike("email", data.email).maybeSingle();
  if (dupEmail) return { ok: false, error: "Email already registered." };

  const { data: hashData, error: hashErr } = await supabase.rpc("hash_password", { _password: data.password });
  if (hashErr || !hashData) return { ok: false, error: hashErr?.message ?? "Password hash failed" };

  const { data: inserted, error } = await supabase.from("teachers").insert({
    name: data.name, phone: data.phone, email: data.email,
    password_hash: hashData as unknown as string,
  }).select("*").single();
  if (error || !inserted) return { ok: false, error: error?.message ?? "Registration failed" };
  return { ok: true, user: mapTeacher(inserted as TeacherRow) };
};

export const loginStudent = async (admission: string, password: string) => {
  const { data } = await supabase.from("students").select("*")
    .eq("admission", admission).maybeSingle();
  if (!data) return { ok: false as const, error: "Invalid admission number or password." };
  const { data: ok } = await supabase.rpc("verify_password", {
    _password: password, _hash: (data as { password_hash: string }).password_hash,
  });
  if (!ok) return { ok: false as const, error: "Invalid admission number or password." };
  const user = mapStudent(data as StudentRow);
  setSession({ userId: user.id, role: "student", name: user.name });
  return { ok: true as const, user };
};

export const loginTeacher = async (email: string, password: string) => {
  const { data } = await supabase.from("teachers").select("*")
    .ilike("email", email).maybeSingle();
  if (!data) return { ok: false as const, error: "Invalid email or password." };
  const { data: ok } = await supabase.rpc("verify_password", {
    _password: password, _hash: (data as { password_hash: string }).password_hash,
  });
  if (!ok) return { ok: false as const, error: "Invalid email or password." };
  const user = mapTeacher(data as TeacherRow);
  setSession({ userId: user.id, role: "teacher", name: user.name });
  return { ok: true as const, user };
};

export const loginAdmin = (username: string, password: string) => {
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return { ok: false as const, error: "Invalid admin credentials." };
  }
  setSession({ userId: ADMIN_USER_ID, role: "admin", name: "Admin" });
  return { ok: true as const };
};

// ---------- mutations ----------
export const addComplaint = async (
  c: Omit<Complaint, "id" | "ticketId" | "createdAt" | "updatedAt" | "status" | "deadline">,
): Promise<Complaint | null> => {
  const { data: ticketId, error: tErr } = await supabase.rpc("next_ticket_id");
  if (tErr || !ticketId) { console.error(tErr); return null; }
  const createdAt = Date.now();
  const deadline = new Date(slaDeadlineFrom(createdAt, c.urgency)).toISOString();
  const { data, error } = await supabase.from("complaints").insert({
    ticket_id: ticketId as unknown as string,
    author_id: c.authorId, author_name: c.authorName, author_role: c.authorRole,
    description: c.description, urgency: c.urgency, status: "pending",
    category: c.category ?? null, subtopic: c.subtopic ?? null,
    deadline,
  }).select("*").single();
  if (error || !data) { console.error(error); return null; }
  const complaint = mapComplaint(data as ComplaintRow);
  await pushNotification({
    userId: ADMIN_USER_ID,
    title: c.urgency === "high" ? "🚨 URGENT complaint received" : "New complaint received",
    message: `${complaint.ticketId} — ${c.authorName} (${c.authorRole})`,
  });
  return complaint;
};

export const updateComplaintStatus = async (
  id: string, status: Status, response?: string,
) => {
  const patch: { status: Status; response?: string } =
    response !== undefined ? { status, response } : { status };
  const { data, error } = await supabase.from("complaints")
    .update(patch).eq("id", id).select("*").single();
  if (error || !data) { console.error(error); return; }
  const c = mapComplaint(data as ComplaintRow);
  await pushNotification({
    userId: c.authorId,
    title: `${c.ticketId} ${status}`,
    message: response ? `Admin: ${response}` : `Status updated to "${status}".`,
  });
};

export const addFeedback = async (
  f: Omit<Feedback, "id" | "createdAt">,
): Promise<Feedback | null> => {
  const { data, error } = await supabase.from("feedback").insert({
    author_id: f.authorId, author_name: f.authorName,
    text: f.text, rating: f.rating,
  }).select("*").single();
  if (error || !data) { console.error(error); return null; }
  return mapFeedback(data as FeedbackRow);
};

export const pushNotification = async (
  n: Omit<Notification, "id" | "createdAt" | "read">,
) => {
  await supabase.from("notifications").insert({
    user_id: n.userId, title: n.title, message: n.message, read: false,
  });
};

export const markNotificationsRead = async (userId: string) => {
  await supabase.from("notifications").update({ read: true })
    .eq("user_id", userId).eq("read", false);
};

// ---------- comments ----------
export const fetchComments = async (complaintId: string): Promise<Comment[]> => {
  const { data, error } = await supabase
    .from("complaint_comments").select("*")
    .eq("complaint_id", complaintId)
    .order("created_at", { ascending: true });
  if (error) { console.error(error); return []; }
  return (data as unknown as CommentRow[]).map(mapComment);
};

export const addComment = async (
  c: Omit<Comment, "id" | "createdAt">,
): Promise<Comment | null> => {
  const { data, error } = await supabase
    .from("complaint_comments").insert({
      complaint_id: c.complaintId,
      author_id: c.authorId,
      author_name: c.authorName,
      author_role: c.authorRole,
      message: c.message,
    }).select("*").single();
  if (error || !data) { console.error(error); return null; }
  // Notify the other party
  const { data: parent } = await supabase.from("complaints")
    .select("ticket_id, author_id").eq("id", c.complaintId).maybeSingle();
  if (parent) {
    const p = parent as { ticket_id: string; author_id: string };
    if (c.authorRole === "admin") {
      await pushNotification({
        userId: p.author_id,
        title: `💬 New reply on ${p.ticket_id}`,
        message: c.message.slice(0, 120),
      });
    } else {
      await pushNotification({
        userId: ADMIN_USER_ID,
        title: `💬 ${c.authorName} replied on ${p.ticket_id}`,
        message: c.message.slice(0, 120),
      });
    }
  }
  return mapComment(data as unknown as CommentRow);
};

export const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
export const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";
