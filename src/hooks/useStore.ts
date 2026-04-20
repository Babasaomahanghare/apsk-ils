import { useEffect, useState } from "react";
import {
  getComplaints,
  getFeedback,
  getNotifications,
  getSession,
  getUsers,
  subscribe,
  type Complaint,
  type Feedback,
  type Notification,
  type Session,
  type AppUser,
} from "@/lib/store";

function useStoreSlice<T>(getter: () => T): T {
  const [value, setValue] = useState<T>(getter);
  useEffect(() => {
    setValue(getter());
    return subscribe(() => setValue(getter()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return value;
}

export const useSession = (): Session | null => useStoreSlice(getSession);
export const useUsers = (): AppUser[] => useStoreSlice(getUsers);
export const useComplaints = (): Complaint[] => useStoreSlice(getComplaints);
export const useFeedback = (): Feedback[] => useStoreSlice(getFeedback);
export const useNotifications = (): Notification[] => useStoreSlice(getNotifications);
