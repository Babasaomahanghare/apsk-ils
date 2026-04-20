import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Sparkles, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { FormField } from "@/components/auth/FormField";
import { Button } from "@/components/ui/button";
import {
  validateName,
  validatePhone,
  validateAdmission,
  validateEmail,
  validatePassword,
  validateRequired,
  type FieldErrors,
} from "@/lib/validation";

const StudentAuth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"register" | "login">("register");

  // Register state
  const [form, setForm] = useState({
    name: "",
    studentClass: "",
    section: "",
    admission: "",
    phone: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [validating, setValidating] = useState(false);
  const [validated, setValidated] = useState(false);

  // Login state
  const [loginAdm, setLoginAdm] = useState("");
  const [loginPwd, setLoginPwd] = useState("");

  const update = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setValidated(false);
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const runValidation = () => {
    setValidating(true);
    setValidated(false);
    setTimeout(() => {
      const next: FieldErrors = {};
      const nameErr = validateName(form.name);
      if (nameErr) next.name = nameErr;
      const classErr = validateRequired(form.studentClass, "Class");
      if (classErr) next.studentClass = classErr;
      const sectionErr = validateRequired(form.section, "Section");
      if (sectionErr) next.section = sectionErr;
      const admErr = validateAdmission(form.admission);
      if (admErr) next.admission = admErr;
      const phoneErr = validatePhone(form.phone);
      if (phoneErr) next.phone = phoneErr;
      const emailErr = validateEmail(form.email);
      if (emailErr) next.email = emailErr;
      const pwdErr = validatePassword(form.password);
      if (pwdErr) next.password = pwdErr;

      setErrors(next);
      setValidating(false);

      if (Object.keys(next).length === 0) {
        setValidated(true);
        toast.success("All details verified successfully", {
          description: "You can now complete your registration.",
        });
      } else {
        toast.error("Validation failed", {
          description: "Please fix the highlighted fields.",
        });
      }
    }, 900);
  };

  const handleRegister = () => {
    toast.success("Registration complete", { description: "Welcome to APSK ILS." });
    navigate("/dashboard/student");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const admErr = validateAdmission(loginAdm);
    const pwdErr = validatePassword(loginPwd);
    if (admErr || pwdErr) {
      toast.error(admErr || pwdErr || "Invalid credentials");
      return;
    }
    toast.success("Signed in", { description: "Redirecting to dashboard..." });
    navigate("/dashboard/student");
  };

  return (
    <AuthLayout
      title="Student Portal"
      subtitle="Register or sign in with your student credentials"
      gradient="from-skyblue to-blue-600"
      icon={<Users className="w-7 h-7 text-white" />}
    >
      {/* Mode toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
        {(["register", "login"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
              mode === m ? "bg-white shadow text-navy" : "text-gray-500"
            }`}
          >
            {m === "register" ? "Register" : "Sign In"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {mode === "register" ? (
          <motion.div
            key="register"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <FormField
              id="name"
              label="Full Name"
              value={form.name}
              onChange={(v) => update("name", v)}
              placeholder="Rahul Sharma"
              error={errors.name}
              validated={validated}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                id="class"
                label="Class"
                value={form.studentClass}
                onChange={(v) => update("studentClass", v)}
                placeholder="10"
                error={errors.studentClass}
                validated={validated}
              />
              <FormField
                id="section"
                label="Section"
                value={form.section}
                onChange={(v) => update("section", v)}
                placeholder="A"
                error={errors.section}
                validated={validated}
              />
            </div>
            <FormField
              id="admission"
              label="Admission Number"
              value={form.admission}
              onChange={(v) => update("admission", v)}
              placeholder="12345"
              error={errors.admission}
              validated={validated}
            />
            <FormField
              id="phone"
              label="Phone Number"
              type="tel"
              value={form.phone}
              onChange={(v) => update("phone", v)}
              placeholder="9876543210"
              error={errors.phone}
              validated={validated}
            />
            <FormField
              id="email"
              label="Email"
              type="email"
              value={form.email}
              onChange={(v) => update("email", v)}
              placeholder="you@example.com"
              error={errors.email}
              validated={validated}
            />
            <FormField
              id="password"
              label="Password"
              type="password"
              value={form.password}
              onChange={(v) => update("password", v)}
              placeholder="At least 6 characters"
              error={errors.password}
              validated={validated}
            />

            <div className="pt-2 space-y-3">
              <Button
                type="button"
                onClick={runValidation}
                disabled={validating}
                className="w-full h-11 bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-95 text-white font-semibold"
              >
                {validating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Validating with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" /> Validate Details using AI
                  </>
                )}
              </Button>

              {validated && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md p-3"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  All details verified successfully
                </motion.div>
              )}

              <Button
                type="button"
                onClick={handleRegister}
                disabled={!validated}
                className="w-full h-11 bg-gradient-to-r from-skyblue to-blue-600 hover:opacity-95 text-white font-semibold disabled:opacity-50"
              >
                Complete Registration <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="login"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleLogin}
            className="space-y-4"
          >
            <FormField
              id="loginAdm"
              label="Admission Number"
              value={loginAdm}
              onChange={setLoginAdm}
              placeholder="12345"
            />
            <FormField
              id="loginPwd"
              label="Password"
              type="password"
              value={loginPwd}
              onChange={setLoginPwd}
              placeholder="••••••••"
            />
            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-skyblue to-blue-600 hover:opacity-95 text-white font-semibold"
            >
              Sign In <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
};

export default StudentAuth;
