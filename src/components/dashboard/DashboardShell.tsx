import { ReactNode, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import campusHero from "@/assets/campus-hero.jpg";
import { Button } from "@/components/ui/button";
import { initialsOf, logout, markNotificationsRead, type Session } from "@/lib/store";
import { useNotifications } from "@/hooks/useStore";
import { toast } from "sonner";

interface Props {
  session: Session;
  gradient: string;
  roleLabel: string;
  children: ReactNode;
}

export const DashboardShell = ({ session, gradient, roleLabel, children }: Props) => {
  const navigate = useNavigate();
  const allNotes = useNotifications();
  const myNotes = allNotes.filter((n) => n.userId === session.userId);
  const unread = myNotes.filter((n) => !n.read).length;
  const [open, setOpen] = useState(false);
  const [welcomed, setWelcomed] = useState(false);

  useEffect(() => {
    if (!welcomed) {
      toast.success(`Welcome, ${session.name}`, { description: roleLabel });
      setWelcomed(true);
    }
  }, [session.name, roleLabel, welcomed]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const togglePanel = () => {
    if (!open && unread > 0) markNotificationsRead(session.userId);
    setOpen((o) => !o);
  };

  return (
    <div className="min-h-screen font-poppins relative overflow-x-hidden">
      <div
        className="fixed inset-0 -z-10 bg-center bg-cover bg-no-repeat"
        style={{ backgroundImage: `url(${campusHero})` }}
        aria-hidden="true"
      />
      <div className="fixed inset-0 -z-10 backdrop-blur-md bg-black/65" aria-hidden="true" />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/10 backdrop-blur-md border-b border-white/15">
        <div className="container mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg shrink-0`}
            >
              <span className="text-white font-bold text-sm sm:text-base">
                {initialsOf(session.name)}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs text-white/70 leading-none">{roleLabel}</p>
              <h1 className="text-white font-bold text-sm sm:text-lg leading-tight truncate">
                Welcome, {session.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                size="icon"
                variant="ghost"
                onClick={togglePanel}
                className="text-white hover:bg-white/15 hover:text-white relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-black/30">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Button>
              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 mt-2 w-[88vw] max-w-sm bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-40"
                  >
                    <div className="px-4 py-3 border-b bg-gray-50">
                      <p className="font-semibold text-navy text-sm">Notifications</p>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {myNotes.length === 0 ? (
                        <p className="px-4 py-6 text-sm text-gray-500 text-center">
                          No notifications yet.
                        </p>
                      ) : (
                        myNotes.map((n) => (
                          <div
                            key={n.id}
                            className="px-4 py-3 border-b last:border-0 hover:bg-gray-50"
                          >
                            <p className="text-sm font-semibold text-navy">{n.title}</p>
                            <p className="text-xs text-gray-600 mt-0.5">{n.message}</p>
                            <p className="text-[10px] text-gray-400 mt-1">
                              {new Date(n.createdAt).toLocaleString()}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleLogout}
              className="text-white hover:bg-white/15 hover:text-white"
            >
              <LogOut className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <motion.main
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-3 sm:px-4 py-5 sm:py-8 space-y-5 sm:space-y-6"
      >
        {children}
      </motion.main>
    </div>
  );
};

export const StatusBadge = ({ status }: { status: "pending" | "resolved" | "rejected" }) => {
  const map = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    resolved: "bg-emerald-100 text-emerald-800 border-emerald-300",
    rejected: "bg-red-100 text-red-800 border-red-300",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${map[status]} capitalize`}
    >
      {status}
    </span>
  );
};

export const UrgencyBadge = ({ urgency }: { urgency: "low" | "medium" | "high" }) => {
  const map = {
    low: "bg-slate-100 text-slate-700 border-slate-300",
    medium: "bg-amber-100 text-amber-800 border-amber-300",
    high: "bg-red-500 text-white border-red-600 animate-pulse",
  } as const;
  return (
    <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${map[urgency]}`}>
      {urgency === "high" ? "URGENT" : urgency}
    </span>
  );
};

export const RoleTag = ({ role }: { role: "student" | "teacher" }) => (
  <span
    className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
      role === "student"
        ? "bg-emerald-500/15 text-emerald-700 border border-emerald-300"
        : "bg-blue-500/15 text-blue-700 border border-blue-300"
    }`}
  >
    {role}
  </span>
);
