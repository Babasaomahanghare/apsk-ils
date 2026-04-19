import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LogIn, ShieldCheck, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export type Role = "student" | "teacher" | "admin";

interface Props {
  role: Role | null;
  onClose: () => void;
}

const ROLE_META: Record<Role, { title: string; gradient: string; helper: string }> = {
  student: {
    title: "Student Portal",
    gradient: "from-skyblue to-blue-600",
    helper: "Sign in with your student credentials to submit and track issues.",
  },
  teacher: {
    title: "Teacher Portal",
    gradient: "from-emerald-500 to-emerald-700",
    helper: "Sign in to manage and resolve student issues.",
  },
  admin: {
    title: "Admin Portal",
    gradient: "from-purple-500 to-indigo-600",
    helper: "Authorized administrators only.",
  },
};

export const LoginDialog = ({ role, onClose }: Props) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!role) return;

    if (role === "admin") {
      if (username === "APSKADMINS" && password === "APSKADMINS19065") {
        toast.success("Welcome, Administrator", { description: "Admin dashboard access granted." });
        onClose();
        resetForm();
      } else {
        setError("Invalid admin credentials.");
      }
      return;
    }

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }
    toast.success(`Signed in as ${role}`, {
      description:
        role === "student"
          ? "You can now submit and view your issues."
          : "You can now manage student issues.",
    });
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setError(null);
  };

  const meta = role ? ROLE_META[role] : null;

  return (
    <Dialog
      open={!!role}
      onOpenChange={(o) => {
        if (!o) {
          onClose();
          resetForm();
        }
      }}
    >
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        {meta && (
          <>
            <div className={`bg-gradient-to-br ${meta.gradient} px-6 py-5 text-white`}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-white/20 ring-1 ring-white/30 flex items-center justify-center">
                  {role === "admin" ? <ShieldCheck className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                </div>
                <DialogHeader className="text-left space-y-0">
                  <DialogTitle className="text-white text-xl">{meta.title}</DialogTitle>
                  <DialogDescription className="text-white/80 text-xs">
                    {meta.helper}
                  </DialogDescription>
                </DialogHeader>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={role === "admin" ? "Admin username" : "Enter your username"}
                  autoComplete="username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 rounded-md p-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                className={`w-full bg-gradient-to-r ${meta.gradient} hover:opacity-95 text-white font-semibold h-11`}
              >
                <LogIn className="w-4 h-4 mr-2" /> Sign In
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
