import { motion } from "framer-motion";
import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import campusHero from "@/assets/campus-hero.jpg";

interface Props {
  title: string;
  subtitle?: string;
  gradient: string; // e.g. "from-skyblue to-blue-600"
  icon: ReactNode;
  children: ReactNode;
}

export const AuthLayout = ({ title, subtitle, gradient, icon, children }: Props) => {
  return (
    <div className="min-h-screen font-poppins relative overflow-x-hidden">
      <div
        className="fixed inset-0 -z-10 bg-center bg-cover bg-no-repeat"
        style={{ backgroundImage: `url(${campusHero})` }}
        aria-hidden="true"
      />
      <div className="fixed inset-0 -z-10 backdrop-blur-md bg-black/60" aria-hidden="true" />

      <div className="container mx-auto px-4 py-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white/90 hover:text-white text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="container mx-auto px-4 pb-16 flex justify-center"
      >
        <div className="w-full max-w-xl">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className={`bg-gradient-to-br ${gradient} px-6 py-6 text-white text-center`}>
              <div className="w-14 h-14 mx-auto rounded-full bg-white/20 ring-1 ring-white/30 flex items-center justify-center mb-3">
                {icon}
              </div>
              <h1 className="text-2xl font-bold">{title}</h1>
              {subtitle && <p className="text-white/85 text-sm mt-1">{subtitle}</p>}
            </div>
            <div className="px-6 py-6 sm:px-8 sm:py-8">{children}</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
