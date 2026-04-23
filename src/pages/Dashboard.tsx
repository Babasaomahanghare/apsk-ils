import { Navigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";
import { useSession } from "@/hooks/useStore";
import { TeacherDashboard } from "./dashboards/TeacherDashboard";
import { AdminDashboard } from "./dashboards/AdminDashboard";

const Dashboard = () => {
  const { role } = useParams();
  const session = useSession();

  // Notify (once) when blocked by URL tampering, then redirect home.
  useEffect(() => {
    if (!session) {
      toast.error("Please sign in to continue.");
    } else if (session.role !== role) {
      toast.error("Access denied", { description: "You don't have permission to view that portal." });
    }
  }, [session, role]);

  if (!session) return <Navigate to="/" replace />;
  // Strict: any mismatch (including ?role=student attempts after student portal removal) → home.
  if (session.role !== role) return <Navigate to="/" replace />;

  if (session.role === "teacher") return <TeacherDashboard session={session} />;
  if (session.role === "admin") return <AdminDashboard session={session} />;
  return <Navigate to="/" replace />;
};

export default Dashboard;
