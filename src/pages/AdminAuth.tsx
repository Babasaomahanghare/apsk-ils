import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { FormField } from "@/components/auth/FormField";
import { Button } from "@/components/ui/button";
import { loginAdmin } from "@/lib/store";

const AdminAuth = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = loginAdmin(username, password);
    if (res.ok) {
      navigate("/dashboard/admin");
    } else {
      setError(res.error || "Invalid admin credentials.");
      toast.error("Access denied", { description: res.error });
    }
  };

  return (
    <AuthLayout
      title="Admin Portal"
      subtitle="Authorized administrators only"
      gradient="from-purple-500 to-indigo-600"
      icon={<ShieldCheck className="w-7 h-7 text-white" />}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          id="admin-user"
          label="Username"
          value={username}
          onChange={setUsername}
          placeholder="Admin username"
          autoComplete="username"
        />
        <FormField
          id="admin-pwd"
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          autoComplete="current-password"
        />

        {error && (
          <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 rounded-md p-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-11 bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-95 text-white font-semibold"
        >
          Sign In <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </form>
    </AuthLayout>
  );
};

export default AdminAuth;
