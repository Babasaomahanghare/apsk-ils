import { useEffect, useState } from "react";
import { Mail, Plus, Trash2, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchApprovedTeachers, addApprovedTeacher, removeApprovedTeacher,
  type ApprovedTeacher,
} from "@/lib/store";
import { toast } from "sonner";

/** Super Admin–only panel to manage the teacher email whitelist. */
export const ApprovedTeachersPanel = () => {
  const [list, setList] = useState<ApprovedTeacher[]>([]);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = () => {
    fetchApprovedTeachers().then(setList);
  };

  useEffect(() => {
    refresh();
    const ch = supabase
      .channel(`rt-approved-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "approved_teachers" }, refresh)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    const res = await addApprovedTeacher(email);
    setBusy(false);
    if (!res.ok) {
      toast.error("Could not add email", { description: res.error });
      return;
    }
    toast.success("✅ Email approved", { description: email.trim().toLowerCase() });
    setEmail("");
  };

  const handleRemove = async (a: ApprovedTeacher) => {
    const res = await removeApprovedTeacher(a.id, a.email);
    if (!res.ok) {
      toast.error("Could not revoke", { description: res.error });
      return;
    }
    toast.success("🗑️ Access revoked", { description: a.email });
  };

  return (
    <Card className="glass-card border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-navy flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600" /> Approved Teacher Emails ({list.length})
        </CardTitle>
        <p className="text-xs text-gray-500 mt-1">
          Only emails on this list can register as teachers. Changes apply instantly.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <form onSubmit={handleAdd} className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teacher@apskhadki.edu.in"
              className="pl-8 h-9 text-sm bg-white"
              disabled={busy}
            />
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={busy || !email.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white h-9"
          >
            <Plus className="w-4 h-4 mr-1" /> Approve
          </Button>
        </form>

        {list.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No approved emails yet.</p>
        ) : (
          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {list.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between gap-2 border border-gray-200 rounded-md p-2 bg-white"
              >
                <div className="min-w-0">
                  <p className="text-sm font-mono text-navy truncate">{a.email}</p>
                  <p className="text-[10px] text-gray-500">
                    Added {new Date(a.addedAt).toLocaleString()}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-red-600 hover:bg-red-50 hover:text-red-700 shrink-0"
                  onClick={() => handleRemove(a)}
                  aria-label={`Remove ${a.email}`}
                  title="Revoke access"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};