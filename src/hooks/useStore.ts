import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchComplaints, fetchFeedback, fetchNotifications, fetchUsers,
  fetchComments, fetchActivityLogs, getSession,
  type Complaint, type Feedback, type Notification, type Session, type AppUser,
  type Comment, type ActivityLog,
} from "@/lib/store";

// Session — cached in localStorage; updates via custom event
export const useSession = (): Session | null => {
  const [s, setS] = useState<Session | null>(getSession);
  useEffect(() => {
    const h = () => setS(getSession());
    window.addEventListener("apsk:session", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("apsk:session", h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return s;
};

function useRealtime<T>(
  fetcher: () => Promise<T[]>,
  table: string,
): T[] {
  const [value, setValue] = useState<T[]>([]);
  useEffect(() => {
    let alive = true;
    fetcher().then((v) => { if (alive) setValue(v); });
    const ch = supabase
      .channel(`rt-${table}-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table }, () => {
        fetcher().then((v) => { if (alive) setValue(v); });
      })
      .subscribe();
    return () => { alive = false; supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return value;
}

export const useComplaints = (): Complaint[] => useRealtime<Complaint>(fetchComplaints, "complaints");
export const useFeedback = (): Feedback[] => useRealtime<Feedback>(fetchFeedback, "feedback");
export const useNotifications = (): Notification[] => useRealtime<Notification>(fetchNotifications, "notifications");
export const useActivityLogs = (): ActivityLog[] => useRealtime<ActivityLog>(() => fetchActivityLogs(500), "activity_logs");

// Users = students + teachers; refresh on either table change
export const useUsers = (): AppUser[] => {
  const [value, setValue] = useState<AppUser[]>([]);
  useEffect(() => {
    let alive = true;
    const refresh = () => fetchUsers().then((v) => { if (alive) setValue(v); });
    refresh();
    const ch = supabase
      .channel(`rt-users-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "students" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "teachers" }, refresh)
      .subscribe();
    return () => { alive = false; supabase.removeChannel(ch); };
  }, []);
  return value;
};

// Comments for a single complaint
export const useComments = (complaintId: string): Comment[] => {
  const [value, setValue] = useState<Comment[]>([]);
  useEffect(() => {
    let alive = true;
    const refresh = () => fetchComments(complaintId).then((v) => { if (alive) setValue(v); });
    refresh();
    const ch = supabase
      .channel(`rt-comments-${complaintId}-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "complaint_comments", filter: `complaint_id=eq.${complaintId}` },
        refresh,
      )
      .subscribe();
    return () => { alive = false; supabase.removeChannel(ch); };
  }, [complaintId]);
  return value;
};

// Realtime presence — counts online users by role
export interface PresenceCounts { student: number; teacher: number; admin: number; total: number }
export const usePresence = (session: Session | null): PresenceCounts => {
  const [counts, setCounts] = useState<PresenceCounts>({ student: 0, teacher: 0, admin: 0, total: 0 });
  useEffect(() => {
    if (!session) return;
    const channel = supabase.channel("apsk-presence", {
      config: { presence: { key: session.userId } },
    });
    const update = () => {
      const state = channel.presenceState() as Record<string, Array<{ role: Session["role"] }>>;
      const c: PresenceCounts = { student: 0, teacher: 0, admin: 0, total: 0 };
      for (const key of Object.keys(state)) {
        const meta = state[key]?.[0];
        if (!meta) continue;
        if (meta.role === "student") c.student++;
        else if (meta.role === "teacher") c.teacher++;
        else if (meta.role === "admin") c.admin++;
        c.total++;
      }
      setCounts(c);
    };
    channel
      .on("presence", { event: "sync" }, update)
      .on("presence", { event: "join" }, update)
      .on("presence", { event: "leave" }, update)
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ role: session.role, name: session.name });
        }
      });
    return () => { supabase.removeChannel(channel); };
  }, [session?.userId, session?.role, session?.name]);
  return counts;
};
