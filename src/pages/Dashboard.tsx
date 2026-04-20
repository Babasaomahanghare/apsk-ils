import { Navigate, useParams } from "react-router-dom";
import { useSession } from "@/hooks/useStore";
import { StudentDashboard } from "./dashboards/StudentDashboard";
import { TeacherDashboard } from "./dashboards/TeacherDashboard";
import { AdminDashboard } from "./dashboards/AdminDashboard";

const Dashboard = () => {
  const { role } = useParams();
  const session = useSession();

  if (!session) return <Navigate to="/" replace />;
  if (session.role !== role) return <Navigate to={`/dashboard/${session.role}`} replace />;

  if (session.role === "student") return <StudentDashboard session={session} />;
  if (session.role === "teacher") return <TeacherDashboard session={session} />;
  if (session.role === "admin") return <AdminDashboard session={session} />;
  return <Navigate to="/" replace />;
};

export default Dashboard;
