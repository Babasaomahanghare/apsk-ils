import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Sparkles, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { FormField } from "@/components/auth/FormField";
import { Button } from "@/components/ui/button";
import {
  validateName,
  validatePhone,
  validateEmail,
  validatePassword,
  type FieldErrors,
} from "@/lib/validation";
import { loginTeacher, registerTeacher } from "@/lib/store";

const TeacherAuth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"register" | "login">("register");

  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [validating, setValidating] = useState(false);
  const [validated, setValidated] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
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
        toast.success("All details verified successfully");
      } else {
        toast.error("Validation failed", { description: "Please fix the highlighted fields." });
      }
    }, 900);
  };

  const handleRegister = () => {
    const res = registerTeacher({
      name: form.name.trim().replace(/\s+/g, " "),
      phone: form.phone.trim(),
      email: form.email.trim(),
      password: form.password,
    });
    if (!res.ok) {
      toast.error("Registration failed", { description: res.error });
      return;
    }
    const login = loginTeacher(form.email.trim(), form.password);
    if (login.ok) {
      toast.success("Registration complete");
      navigate("/dashboard/teacher");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const emailErr = validateEmail(loginEmail);
    const pwdErr = validatePassword(loginPwd);
    if (emailErr || pwdErr) {
      toast.error(emailErr || pwdErr || "Invalid credentials");
      return;
    }
    const res = loginTeacher(loginEmail.trim(), loginPwd);
    if (!res.ok) {
      toast.error("Sign-in failed", { description: res.error });
      return;
    }
    navigate("/dashboard/teacher");
  };

  return (
    <AuthLayout
      title="Teacher Portal"
      subtitle="Register or sign in to manage student issues"
      gradient="from-emerald-500 to-emerald-700"
      icon={<GraduationCap className="w-7 h-7 text-white" />}
    >
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
              id="t-name"
              label="Full Name"
              value={form.name}
              onChange={(v) => update("name", v)}
              placeholder="Anjali Verma"
              error={errors.name}
              validated={validated}
            />
            <FormField
              id="t-phone"
              label="Phone Number"
              type="tel"
              value={form.phone}
              onChange={(v) => update("phone", v)}
              placeholder="9876543210"
              error={errors.phone}
              validated={validated}
            />
            <FormField
              id="t-email"
              label="Email"
              type="email"
              value={form.email}
              onChange={(v) => update("email", v)}
              placeholder="teacher@apskhadki.edu.in"
              error={errors.email}
              validated={validated}
            />
            <FormField
              id="t-password"
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
                className="w-full h-11 bg-gradient-to-r from-emerald-500 to-emerald-700 hover:opacity-95 text-white font-semibold disabled:opacity-50"
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
              id="t-login-email"
              label="Email"
              type="email"
              value={loginEmail}
              onChange={setLoginEmail}
              placeholder="teacher@apskhadki.edu.in"
            />
            <FormField
              id="t-login-pwd"
              label="Password"
              type="password"
              value={loginPwd}
              onChange={setLoginPwd}
              placeholder="••••••••"
            />
            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-emerald-500 to-emerald-700 hover:opacity-95 text-white font-semibold"
            >
              Sign In <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
};

export default TeacherAuth;
