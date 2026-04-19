import { useState } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Users,
  Shield,
  LogIn,
  ClipboardList,
  KeyRound,
  Zap,
  Phone,
  Mail,
  MapPin,
  Image as ImageIcon,
  BadgeCheck,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Disclaimer } from "@/components/Disclaimer";
import { LoginDialog, type Role } from "@/components/LoginDialog";
import campusHero from "@/assets/campus-hero.jpg";
import devSoham from "@/assets/dev-soham.jpg";
import devAtharv from "@/assets/dev-atharv.jpg";

const portals = [
  {
    role: "student" as Role,
    title: "Student Portal",
    description: "Submit and track your issues easily.",
    icon: Users,
    gradient: "from-skyblue to-blue-600",
    button: "Student Login",
  },
  {
    role: "teacher" as Role,
    title: "Teacher Portal",
    description: "Manage and resolve student issues.",
    icon: Users,
    gradient: "from-emerald-500 to-emerald-700",
    button: "Teacher Login",
  },
  {
    role: "admin" as Role,
    title: "Admin Portal",
    description: "Full control and monitoring dashboard.",
    icon: Shield,
    gradient: "from-purple-500 to-indigo-600",
    button: "Admin Login",
  },
];

const features = [
  {
    title: "Issue Tracking",
    description: "Log and monitor issues in real-time with clear status updates and structured workflows.",
    icon: ClipboardList,
    gradient: "from-blue-500 to-blue-700",
  },
  {
    title: "Role-Based Access",
    description: "Secure login for students, teachers and administrators with proper permission boundaries.",
    icon: KeyRound,
    gradient: "from-emerald-500 to-emerald-700",
  },
  {
    title: "Efficient Resolution",
    description: "Faster communication and a tracking system that keeps every complaint accountable.",
    icon: Zap,
    gradient: "from-purple-500 to-indigo-600",
  },
];

const developers = [
  {
    name: "Soham Mahangare",
    role: "🚀 Lead Developer",
    description: "Architect and lead developer of the APSK Issue Logging System.",
    image: devSoham,
  },
  {
    name: "Atharv Mishra",
    role: "🔧 Co-Developer",
    description: "Co-developer focused on UI, features and quality of the ILS platform.",
    image: devAtharv,
  },
];

const galleryItems = [
  { title: "Campus Front", caption: "Iconic main building" },
  { title: "Annual Day", caption: "Cultural celebrations" },
  { title: "Sports Meet", caption: "Athletic excellence" },
  { title: "Independence Day", caption: "Pride & tradition" },
];

const Index = () => {
  const [activeRole, setActiveRole] = useState<Role | null>(null);

  return (
    <div className="min-h-screen font-poppins relative overflow-x-hidden">
      {/* Fixed background — uses scroll attachment via fixed positioning, avoids iOS bg-fixed bugs */}
      <div
        className="fixed inset-0 -z-10 bg-center bg-cover bg-no-repeat"
        style={{ backgroundImage: `url(${campusHero})` }}
        aria-hidden="true"
      />
      <div className="fixed inset-0 -z-10 backdrop-blur-md bg-black/55" aria-hidden="true" />

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/10 backdrop-blur-sm border-b border-white/20 sticky top-0 z-30">
          <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-3">
            <a href="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-gold to-yellow-600 rounded-lg flex items-center justify-center shadow-lg shrink-0">
                <span className="text-navy font-bold text-lg sm:text-xl">A</span>
              </div>
              <div className="min-w-0">
                <h1 className="text-gold font-bold text-base sm:text-2xl leading-none truncate">APS KHADKI</h1>
                <p className="text-[10px] sm:text-sm text-slate-100/90 truncate">Army Public School Khadki</p>
              </div>
            </a>
            <div className="hidden lg:flex items-center space-x-6 text-sm shrink-0">
              <p className="font-semibold text-skyblue">Issue Logging System</p>
              <p className="text-neutral-300">Log. Track. Resolve.</p>
            </div>
            <div className="lg:hidden text-skyblue text-xs font-semibold whitespace-nowrap">ILS</div>
          </div>
        </header>

        <main>
          {/* Hero */}
          <section className="container mx-auto px-4 pt-10 sm:pt-16 pb-8 sm:pb-10">
            <div className="text-center max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, type: "spring" }}
                className="flex justify-center mb-5 sm:mb-6"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-skyblue to-blue-600 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-white/10">
                  <GraduationCap className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="heading-on-dark mb-5 sm:mb-6 leading-[1.05] tracking-tight"
                style={{ fontSize: "clamp(1.875rem, 7vw, 4rem)" }}
              >
                ARMY PUBLIC SCHOOL KHADKI
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="text-base sm:text-lg md:text-xl body-on-dark max-w-3xl mx-auto leading-relaxed px-2 sm:px-0"
              >
                A comprehensive digital Issue Logging System (ILS) for managing student complaints, teacher
                responses, and administrative actions with real-time tracking and structured workflows.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-6 sm:mt-8 inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 backdrop-blur px-4 py-1.5 text-white/90 text-xs sm:text-sm"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Official APSK Platform
              </motion.div>
            </div>
          </section>

          {/* Gallery */}
          <section className="container mx-auto px-4 py-8 sm:py-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl heading-on-dark text-center mb-6 sm:mb-8">APSK GALLERY</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {galleryItems.map((g, i) => (
                <Card
                  key={g.title}
                  className="glass-card animate-fade-in overflow-hidden border-0"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="aspect-square bg-gradient-to-br from-skyblue/30 via-navy/20 to-gold/30 flex items-center justify-center">
                    <ImageIcon className="w-10 h-10 text-navy/40" />
                  </div>
                  <CardContent className="p-3 text-center">
                    <p className="font-semibold text-navy text-sm">{g.title}</p>
                    <p className="text-xs text-gray-500">{g.caption}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Login portals */}
          <section className="container mx-auto px-4 py-12">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl heading-on-dark mb-3">Choose Your Portal</h2>
              <p className="body-on-dark max-w-2xl mx-auto">
                Sign in to the appropriate portal based on your role at APS Khadki.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {portals.map((p, i) => {
                const Icon = p.icon;
                return (
                  <Card
                    key={p.title}
                    className="glass-card border-0 animate-fade-in"
                    style={{ animationDelay: `${0.2 + i * 0.15}s` }}
                  >
                    <CardHeader className="text-center pb-4">
                      <div
                        className={`w-16 h-16 bg-gradient-to-br ${p.gradient} rounded-full flex items-center justify-center mx-auto mb-4 shadow-md`}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-2xl text-navy">{p.title}</CardTitle>
                      <CardDescription className="text-gray-600">{p.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() => setActiveRole(p.role)}
                        className={`w-full h-11 bg-gradient-to-r ${p.gradient} hover:opacity-95 text-white font-semibold`}
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        {p.button}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Features */}
          <section className="container mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl heading-on-dark mb-3">System Features</h2>
              <p className="body-on-dark max-w-2xl mx-auto">
                Built to make raising and resolving issues simple, accountable, and fast.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto text-center">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <div
                      className={`w-20 h-20 bg-gradient-to-br ${f.gradient} rounded-full flex items-center justify-center mx-auto mb-5 shadow-xl`}
                    >
                      <Icon className="w-9 h-9 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 drop-shadow">{f.title}</h3>
                    <p className="text-white/80 leading-relaxed">{f.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Meet the developers */}
          <section className="container mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl heading-on-dark mb-3">Meet the Developers</h2>
              <p className="body-on-dark max-w-2xl mx-auto">
                The team behind the APSK Issue Logging System.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {developers.map((d, i) => (
                <motion.div
                  key={d.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                >
                  <Card className="glass-card border-0 overflow-hidden">
                    <CardContent className="p-6 text-center">
                      <div className="relative w-24 h-24 mx-auto mb-4">
                        <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-skyblue to-blue-600 blur-md opacity-60" />
                        <img
                          src={d.image}
                          alt={d.name}
                          width={512}
                          height={512}
                          loading="lazy"
                          className="relative w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-lg"
                        />
                        <span className="absolute -bottom-1 -right-1 bg-skyblue rounded-full p-1 ring-2 ring-white">
                          <BadgeCheck className="w-4 h-4 text-white" aria-label="Verified" />
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-navy">{d.name}</h3>
                      <p className="text-skyblue font-semibold text-sm mt-1">{d.role}</p>
                      <p className="text-gray-600 text-sm mt-3 leading-relaxed">{d.description}</p>
                      <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
                        <BadgeCheck className="w-3.5 h-3.5" />
                        Verified Developer
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-black/30 backdrop-blur-sm border-t border-white/10 py-10 mt-8">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
              <div>
                <h3 className="text-gold font-bold text-lg mb-4">Contact</h3>
                <ul className="space-y-2 text-white/80 text-sm">
                  <li className="flex items-center justify-center md:justify-start gap-2">
                    <Phone className="w-4 h-4 text-skyblue" /> APS Khadki Reception
                  </li>
                  <li className="flex items-center justify-center md:justify-start gap-2">
                    <Mail className="w-4 h-4 text-skyblue" /> ils@apskhadki.edu.in
                  </li>
                  <li className="flex items-center justify-center md:justify-start gap-2">
                    <MapPin className="w-4 h-4 text-skyblue" /> Army Public School, Khadki
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-gold font-bold text-lg mb-4">Portals</h3>
                <ul className="space-y-2 text-white/80 text-sm">
                  <li>Student Portal</li>
                  <li>Teacher Portal</li>
                  <li>Admin Portal</li>
                </ul>
              </div>
              <div>
                <h3 className="text-gold font-bold text-lg mb-4">ILS Highlights</h3>
                <ul className="space-y-2 text-white/80 text-sm">
                  <li>📝 Issue Tracking</li>
                  <li>🔐 Role-Based Access</li>
                  <li>⚡ Efficient Resolution</li>
                  <li>📱 Mobile Responsive</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/10 mt-8 pt-4 text-center text-white/60 text-sm">
              © 2026 Army Public School Khadki — Issue Logging System (ILS). All rights reserved.
            </div>
          </div>
        </footer>
      </div>

      <Disclaimer />
      <LoginDialog role={activeRole} onClose={() => setActiveRole(null)} />
    </div>
  );
};

export default Index;
