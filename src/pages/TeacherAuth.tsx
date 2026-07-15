import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { FormField } from "@/components/auth/FormField";
import { Button } from "@/components/ui/button";
import { validatePassword, type FieldErrors } from "@/lib/validation";
import { loginTeacher, registerTeacher, validateTeacherUsername, normalizeTeacherUsername } from "@/lib/store";

const TeacherAuth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"register" | "login">("register");

  const [form, setForm] = useState({ username: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const [loginUser, setLoginUser] = useState("");
  const [loginPwd, setLoginPwd] = useState("");

  const update = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: FieldErrors = {};
    const uErr = validateTeacherUsername(form.username);
    if (uErr) next.username = uErr;
    const pErr = validatePassword(form.password);
    if (pErr) next.password = pErr;
    if (form.password !== form.confirm) next.confirm = "Passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length > 0) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setSubmitting(true);
    const username = normalizeTeacherUsername(form.username);
    const res = await registerTeacher({ username, password: form.password });
    if (!res.ok) {
      setSubmitting(false);
      toast.error("Registration failed", { description: res.error });
      return;
    }
    // Auto-login and redirect straight to the dashboard.
    const login = await loginTeacher(username, form.password);
    setSubmitting(false);
    if (login.ok) {
      toast.success("Welcome!", { description: `Signed in as ${username}` });
      navigate("/dashboard/teacher");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const uErr = validateTeacherUsername(loginUser);
    const pwdErr = validatePassword(loginPwd);
    if (uErr || pwdErr) {
      toast.error(uErr || pwdErr || "Invalid credentials");
      return;
    }
    const res = await loginTeacher(loginUser, loginPwd);
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
          <motion.form
            key="register"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleRegister}
            className="space-y-4"
          >
            <FormField
              id="t-username"
              label="Username"
              value={form.username}
              onChange={(v) => update("username", v)}
              placeholder="apsk@firstname"
              error={errors.username}
            />
            <FormField
              id="t-password"
              label="Password"
              type="password"
              value={form.password}
              onChange={(v) => update("password", v)}
              placeholder="At least 6 characters"
              error={errors.password}
            />
            <FormField
              id="t-confirm"
              label="Confirm Password"
              type="password"
              value={form.confirm}
              onChange={(v) => update("confirm", v)}
              placeholder="Repeat password"
              error={errors.confirm}
            />

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-11 bg-gradient-to-r from-emerald-500 to-emerald-700 hover:opacity-95 text-white font-semibold disabled:opacity-50"
            >
              {submitting ? "Creating account..." : (<>Complete Registration <ArrowRight className="w-4 h-4 ml-2" /></>)}
            </Button>
          </motion.form>
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
              id="t-login-username"
              label="Username"
              value={loginUser}
              onChange={setLoginUser}
              placeholder="apsk@firstname"
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
