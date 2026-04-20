// Shared localStorage-backed store with cross-tab sync via 'storage' event.
// All data is REAL — written by users via the app. No seeded mock data.

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
  password: string;
  createdAt: number;
}
export interface TeacherUser {
  id: string;
  role: "teacher";
  name: string;
  phone: string;
  email: string;
  password: string;
  createdAt: number;
}
export type AppUser = StudentUser | TeacherUser;

export interface Complaint {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: "student" | "teacher";
  description: string;
  urgency: Urgency;
  status: Status;
  category?: string;   // teacher only
  subtopic?: string;   // teacher only
  response?: string;   // admin response
  createdAt: number;
  updatedAt: number;
}

export interface Feedback {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  rating: number; // 1..5
  createdAt: number;
}

export interface Notification {
  id: string;
  userId: string; // recipient
  title: string;
  message: string;
  read: boolean;
  createdAt: number;
}

export interface Session {
  userId: string;
  role: Role;
  name: string;
}

const KEYS = {
  users: "apsk.users",
  complaints: "apsk.complaints",
  feedback: "apsk.feedback",
  notifications: "apsk.notifications",
  session: "apsk.session",
} as const;

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

// ---------- low-level helpers ----------
const read = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key: string, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value));
  // Same-tab listeners (storage event only fires on OTHER tabs)
  window.dispatchEvent(new CustomEvent("apsk:store", { detail: { key } }));
};

const uid = () =>
  (crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);

// ---------- accessors ----------
export const getUsers = (): AppUser[] => read<AppUser[]>(KEYS.users, []);
export const getComplaints = (): Complaint[] => read<Complaint[]>(KEYS.complaints, []);
export const getFeedback = (): Feedback[] => read<Feedback[]>(KEYS.feedback, []);
export const getNotifications = (): Notification[] => read<Notification[]>(KEYS.notifications, []);
export const getSession = (): Session | null => read<Session | null>(KEYS.session, null);

// ---------- mutations ----------
export const registerStudent = (
  data: Omit<StudentUser, "id" | "role" | "createdAt">,
): { ok: boolean; error?: string; user?: StudentUser } => {
  const users = getUsers();
  if (users.some((u) => u.role === "student" && (u as StudentUser).admission === data.admission)) {
    return { ok: false, error: "Admission number already registered." };
  }
  if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
    return { ok: false, error: "Email already registered." };
  }
  const user: StudentUser = { ...data, id: uid(), role: "student", createdAt: Date.now() };
  write(KEYS.users, [...users, user]);
  return { ok: true, user };
};

export const registerTeacher = (
  data: Omit<TeacherUser, "id" | "role" | "createdAt">,
): { ok: boolean; error?: string; user?: TeacherUser } => {
  const users = getUsers();
  if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
    return { ok: false, error: "Email already registered." };
  }
  const user: TeacherUser = { ...data, id: uid(), role: "teacher", createdAt: Date.now() };
  write(KEYS.users, [...users, user]);
  return { ok: true, user };
};

export const loginStudent = (admission: string, password: string) => {
  const u = getUsers().find(
    (x) => x.role === "student" && (x as StudentUser).admission === admission && x.password === password,
  ) as StudentUser | undefined;
  if (!u) return { ok: false, error: "Invalid admission number or password." } as const;
  setSession({ userId: u.id, role: "student", name: u.name });
  return { ok: true, user: u } as const;
};

export const loginTeacher = (email: string, password: string) => {
  const u = getUsers().find(
    (x) => x.role === "teacher" && x.email.toLowerCase() === email.toLowerCase() && x.password === password,
  ) as TeacherUser | undefined;
  if (!u) return { ok: false, error: "Invalid email or password." } as const;
  setSession({ userId: u.id, role: "teacher", name: u.name });
  return { ok: true, user: u } as const;
};

export const loginAdmin = (username: string, password: string) => {
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return { ok: false, error: "Invalid admin credentials." } as const;
  }
  setSession({ userId: ADMIN_USER_ID, role: "admin", name: "Admin" });
  return { ok: true } as const;
};

export const setSession = (s: Session | null) => {
  if (s) write(KEYS.session, s);
  else {
    localStorage.removeItem(KEYS.session);
    window.dispatchEvent(new CustomEvent("apsk:store", { detail: { key: KEYS.session } }));
  }
};

export const logout = () => setSession(null);

export const addComplaint = (
  c: Omit<Complaint, "id" | "createdAt" | "updatedAt" | "status">,
): Complaint => {
  const complaint: Complaint = {
    ...c,
    id: uid(),
    status: "pending",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  write(KEYS.complaints, [complaint, ...getComplaints()]);
  // Notify admin
  pushNotification({
    userId: ADMIN_USER_ID,
    title: c.urgency === "high" ? "🚨 URGENT complaint received" : "New complaint received",
    message: `${c.authorName} (${c.authorRole}) submitted a complaint.`,
  });
  return complaint;
};

export const updateComplaintStatus = (
  id: string,
  status: Status,
  response?: string,
) => {
  const list = getComplaints();
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return;
  const updated: Complaint = {
    ...list[idx],
    status,
    response: response ?? list[idx].response,
    updatedAt: Date.now(),
  };
  list[idx] = updated;
  write(KEYS.complaints, list);
  // Notify the author
  pushNotification({
    userId: updated.authorId,
    title: `Complaint ${status}`,
    message: response
      ? `Admin: ${response}`
      : `Your complaint status was updated to "${status}".`,
  });
};

export const addFeedback = (f: Omit<Feedback, "id" | "createdAt">): Feedback => {
  const fb: Feedback = { ...f, id: uid(), createdAt: Date.now() };
  write(KEYS.feedback, [fb, ...getFeedback()]);
  return fb;
};

export const pushNotification = (n: Omit<Notification, "id" | "createdAt" | "read">) => {
  const note: Notification = { ...n, id: uid(), read: false, createdAt: Date.now() };
  write(KEYS.notifications, [note, ...getNotifications()]);
};

export const markNotificationsRead = (userId: string) => {
  const list = getNotifications().map((n) => (n.userId === userId ? { ...n, read: true } : n));
  write(KEYS.notifications, list);
};

// ---------- subscription ----------
export const subscribe = (cb: () => void) => {
  const handler = () => cb();
  window.addEventListener("storage", handler);
  window.addEventListener("apsk:store", handler as EventListener);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("apsk:store", handler as EventListener);
  };
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
