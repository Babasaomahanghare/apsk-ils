import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Construction, Users, GraduationCap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import campusHero from "@/assets/campus-hero.jpg";

const META: Record<string, { title: string; gradient: string; Icon: typeof Users }> = {
  student: { title: "Student Dashboard", gradient: "from-skyblue to-blue-600", Icon: Users },
  teacher: { title: "Teacher Dashboard", gradient: "from-emerald-500 to-emerald-700", Icon: GraduationCap },
  admin: { title: "Admin Dashboard", gradient: "from-purple-500 to-indigo-600", Icon: ShieldCheck },
};

const Dashboard = () => {
  const { role = "student" } = useParams();
  const meta = META[role] ?? META.student;
  const Icon = meta.Icon;

  return (
    <div className="min-h-screen font-poppins relative overflow-x-hidden flex flex-col">
      <div
        className="fixed inset-0 -z-10 bg-center bg-cover bg-no-repeat"
        style={{ backgroundImage: `url(${campusHero})` }}
        aria-hidden="true"
      />
      <div className="fixed inset-0 -z-10 backdrop-blur-md bg-black/60" aria-hidden="true" />

      <div className="container mx-auto px-4 py-6">
        <Link to="/" className="inline-flex items-center gap-2 text-white/90 hover:text-white text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-lg w-full text-center"
        >
          <div className={`bg-gradient-to-br ${meta.gradient} px-6 py-8 text-white`}>
            <div className="w-16 h-16 mx-auto rounded-full bg-white/20 ring-1 ring-white/30 flex items-center justify-center mb-3">
              <Icon className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold">{meta.title}</h1>
          </div>
          <div className="px-6 py-10 sm:px-10">
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-4">
              <Construction className="w-7 h-7 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-navy mb-2">Dashboard coming soon</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              You're successfully signed in. Full dashboard functionality is under active development.
            </p>
            <Link to="/">
              <Button className={`bg-gradient-to-r ${meta.gradient} hover:opacity-95 text-white font-semibold h-11 px-6`}>
                Return to Home
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
