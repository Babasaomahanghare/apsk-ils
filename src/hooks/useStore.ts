import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchComplaints, fetchFeedback, fetchNotifications, fetchUsers,
  getSession,
  type Complaint, type Feedback, type Notification, type Session, type AppUser,
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
